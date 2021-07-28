import {
  createContext,
  createElement,
  FC,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

interface IGatherEntry {
  element: HTMLElement;
  data: any;
}

interface IGatherEntriesContext {
  entries: IGatherEntry[];
}

interface IGatherUpdaterContext {
  update(f: (current: IGatherEntry[]) => IGatherEntry[]): void;
}

export const GatherEntriesContext = createContext<IGatherEntriesContext>({
  entries: []
});

const GatherUpdaterContext = createContext<IGatherUpdaterContext | null>(null);

let classIndex = 1;

function sortEntries(entries: IGatherEntry[]) {
  if (entries.length === 0) {
    return [];
  }

  // Tag all elements with a special class.
  const className = `gather-selector-${classIndex++}`;
  const elements = entries.map(entry => entry.element);
  elements.forEach(element => {
    element.classList.add(className);
  });

  // Fetch all elements with this class in document order, and put their entries into the array.
  const sortedEntries: IGatherEntry[] = [];
  Array.prototype.slice
    .call(document.querySelectorAll(`.${className}`))
    .forEach(element => {
      const entry = entries.find(e => e.element === element);
      if (entry) {
        sortedEntries.push(entry);
      }
    });

  // Remove the special class.
  elements.forEach(element => {
    element.classList.remove(className);
  });

  return sortedEntries;
}

export const GatherContainer: FC<{}> = ({ children }) => {
  const [entries, setEntries] = useState<IGatherEntry[]>([]);
  const entriesValue = useMemo(() => ({ entries }), [entries]);

  // Create a value for the updater context, which is static but updates the entries.
  const updaterValue = useMemo<
    IGatherUpdaterContext & { entries: IGatherEntry[] }
  >(
    () => ({
      entries: [],
      update(f: (current: IGatherEntry[]) => IGatherEntry[]) {
        const prevEntries = this.entries;
        this.entries = sortEntries(f(this.entries));
        if (
          prevEntries.length !== this.entries.length ||
          this.entries.some((v, i) => prevEntries[i] !== v)
        ) {
          // Entries have changed.
          setEntries(this.entries);
        }
      }
    }),
    [setEntries]
  );
  updaterValue.entries = entries;

  // Render the children inside nested entries and updater contexts.
  return createElement(
    GatherEntriesContext.Provider,
    { value: entriesValue },
    createElement(
      GatherUpdaterContext.Provider,
      { value: updaterValue },
      children
    )
  );
};

export interface IGatheredElement<T> {
  element: HTMLElement;
  data: T;
}

type ElementSelector<T> = ((elem: any) => elem is T) | ((elem: any) => boolean);

export function useGatheredData<T>(match: ElementSelector<T>): T[];

export function useGatheredData(match: (elem: any) => boolean): any[] {
  const elements = useGatheredElements(match);
  return useMemo(() => elements.map(e => e.data), [elements]);
}

export function useGatheredElements<T>(
  match: ElementSelector<T>
): Array<IGatheredElement<T>>;

export function useGatheredElements(match: (elem: any) => boolean): any[] {
  const { entries } = useContext(GatherEntriesContext);
  return useMemo(() => entries.filter(e => match(e.data)), [match, entries]);
}

export function useGather<T>(data: T): RefObject<any> {
  const ref = useRef<any>();
  const updater = useContext(GatherUpdaterContext);
  if (updater === null) {
    throw new Error(
      "You should only call useGather() inside a GatherContainer context."
    );
  }

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // Add the entry.
    updater.update(current => [...current, { element: ref.current, data }]);

    const refElement = ref.current;

    return () => {
      // Remove the entry.
      updater.update(current =>
        current.filter(entry => entry.element !== refElement)
      );
    };
  }, [data, updater]);

  return ref;
}
