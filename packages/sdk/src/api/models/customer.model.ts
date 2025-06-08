export type Customer<T extends object = object> = {
  id: string;
  metadata: T;
  email: string;
  createdAt: string;
  updatedAt: string;
  reference?: string;
};
