import IGroup from './Group';

export interface IBoardMetadata {
  name: string;
  description: string;
}

export default interface IBoard extends IBoardMetadata {
  id: string;
  groups: IGroup[];
}