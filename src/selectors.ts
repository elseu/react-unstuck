export interface ILabels {
  [k: string]: any;
}

export type ISelector = ISelectorFunction | ISimpleSelector;

interface ISelectorInput {
  labels: ILabels;
}

export type ISelectorFunction = (input: ISelectorInput) => boolean;

interface ISimpleSelector {
  labels?: ILabels;
  excludeLabels?: ILabels;
}

export function selectorFunction(
  selector: ISelector | null | undefined
): ISelectorFunction | null {
  if (selector === null || selector === undefined) {
    return null;
  }
  if (typeof selector === "function") {
    return selector;
  }
  return simpleSelectorFunction(selector);
}

function simpleSelectorFunction(
  selector: ISimpleSelector
): ISelectorFunction | null {
  if (selector.labels) {
    const { labels: selectorLabels, ...other } = selector;
    const otherSelector = simpleSelectorFunction(other);
    return input =>
      matchesLabels(input, selectorLabels) &&
      (!otherSelector || otherSelector(input));
  }
  if (selector.excludeLabels) {
    const { excludeLabels: selectorLabels, ...other } = selector;
    const otherSelector = simpleSelectorFunction(other);
    return input =>
      !matchesLabels(input, selectorLabels) &&
      (!otherSelector || otherSelector(input));
  }
  return null;
}

function matchesLabels(
  input: ISelectorInput,
  selectorLabels: ILabels
): boolean {
  const { labels } = input;
  for (const k of Object.keys(selectorLabels)) {
    if (selectorLabels[k] !== labels[k]) {
      return false;
    }
  }
  return true;
}
