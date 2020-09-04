import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { Unionize } from 'utility-types';

/**
 * for each model
 */
export type Model<
  Name extends string = string,
  State = any,
  DexReducer extends Record<
    string,
    (state: State, payload: any) => State
  > = Record<string, (state: State, payload: any) => State>
> = {
  name: Name;
  state: State;
  reducers: DexReducer;
};

/**
 * for createModel function
 */
export type ModelCreator = <
  Name extends string,
  State,
  DexReducer extends Record<string, (state: State, payload: any) => State>,
  M extends Model<Name, State, DexReducer> = Model<Name, State, DexReducer>
>(m: {
  name: Name;
  state: State;
  reducers: DexReducer;
}) => {
  name: M['name'];
  state: M['state'];
  reducers: {
    [K in keyof M['reducers']]: (
      action: Parameters<M['reducers'][K]>[1] extends undefined
        ? {
            type: K;
          }
        : {
            type: K;
            payload: Parameters<M['reducers'][K]>[1];
          }
    ) => M['state'];
  };
  actionCreators: {
    [K in keyof M['reducers']]: Parameters<
      M['reducers'][K]
    >[1] extends undefined
      ? () => M['state']
      : (payload: Parameters<M['reducers'][K]>[1]) => M['state'];
  };
};

export type StoreInit = <Models extends Record<string, Model>>(c: {
  models: Models;
}) => {
  [K in keyof Models]: Models[K];
}[keyof Models];

export const createModel: ModelCreator = mo => {
  let reducers = {};
  for (const red in mo.reducers) {
    reducers[red as string] = mo.reducers[red];
  }
  // return {
  //   ...mo,
  //   reducers: reducers as any,
  // };
  return undefined as any;
};


export const storeInit: StoreInit = c => {
  return undefined as any;
};



const counter = createModel({
  name: 'counter',
  state: {
    count: 0,
    name: 'asd',
  },
  reducers: {
    inc: (state, payload: number) => ({
      ...state,
      count: state.count + payload,
      e: 1,
    }),
    something: state => ({
      ...state,
      count: 1,
    }),
    some: (state, payload: string) => ({
      ...state,
    }),
  },
});

const counter2 = createModel({
  name: 'counter2',
  state: {
    county: 0,
  },
  reducers: {
    asd: (state, payload: 'inc' | 'dec') => ({
      ...state,
      county: payload === 'inc' ? state.county + 1 : state.county - 1,
    }),
  },
});

const store = storeInit({
  models: {
    counter,
  },
});