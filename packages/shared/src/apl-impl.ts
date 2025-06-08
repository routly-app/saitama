import type { XiorInstance } from "xior";

export abstract class ApiImpl {
  protected abstract path: string;

  constructor(protected readonly xior: XiorInstance) {}

  protected buildPath(...values: (string | number)[]) {
    return this.path + "/" + values.join("/");
  }

  protected buildQueryPath<T extends Record<string, any>>(
    path: string,
    query?: T
  ) {
    const q = new URLSearchParams(query);
    return path + "?" + q.toString();
  }
}

export abstract class Crud<T extends object> extends ApiImpl {
  readonly create = <TData = Partial<T>>(data: TData) => {
    return this.xior.post<T>(this.path, data);
  };

  readonly retrieve = (id: string | number) => {
    return this.xior.get<T>(this.buildPath(id));
  };

  readonly list = <TQuery = Partial<T>>(query?: TQuery) => {
    return this.xior.get<T[]>(this.buildQueryPath(this.path, query!));
  };

  readonly update = <TData = Partial<T>>(id: string | number, data: TData) => {
    return this.xior.patch<T>(this.buildPath(id), data);
  };

  readonly delete = (id: string | number) => {
    return this.xior.delete<T>(this.buildPath(id));
  };
}
