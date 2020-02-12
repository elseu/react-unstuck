export interface ILabels {
  [k: string]: any;
}

interface ISelectorInput {
  labels: ILabels;
}

export type ISelectorFunction = (input: ISelectorInput) => boolean;
