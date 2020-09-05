import { applyMiddleware, combineReducers, createStore, Store } from 'redux';

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
  State,
  Name extends string,
  DexReducer extends Record<string, (state: State, payload: any) => State>,
  M extends Model<Name, State, DexReducer> = Model<Name, State, DexReducer>
>(m: {
  name: Name;
  state: State;
  reducers: DexReducer;
}) => ModelCreatorReturn<M>;

type ModelCreatorReturn<M extends Model> = {
  name: M['name'];
  state: M['state'];
  reducer: {
    [K in keyof M['reducers']]: (
      state: M['state'],
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
  actions: {
    [K in keyof M['reducers']]: Parameters<
      M['reducers'][K]
    >[1] extends undefined
      ? () => { type: K }
      : (
          payload: Parameters<M['reducers'][K]>[1]
        ) => {
          type: K;
          payload: Parameters<M['reducers'][K]>[1];
        };
  };
};

export type StoreInit = <
  Models extends Record<string, ReturnType<ModelCreator>>
>(c: {
  models: Models;
}) => Store<
  {
    [K in keyof Models]: Models[K]['state'] extends (infer P)[]
      ? P[]
      : Models[K]['state'] extends Record<string, infer V>
      ? {
          [L in keyof Models[K]['state']]: V;
        }
      : Models[K]['state'];
  },
  {
    [K in keyof Models]: ReturnType<
      Models[K]['actions'][keyof Models[K]['actions']]
    >;
  }[keyof Models]
>;

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
  },
  reducers: {
    inc: (state, payload: number) => ({
      ...state,
      count: state.count + payload,
    }),
    '@counter/returnOne': state => ({
      ...state,
      count: 1,
    }),
    same: state => ({
      ...state,
    }),
  },
});

const counter2 = createModel({
  name: 'counter2',
  state: 0,
  reducers: {
    depends: (state, payload: 'inc' | 'dec') =>
      payload === 'inc' ? state + 1 : state - 1,
  },
});

const todoList = createModel({
  name: 'todoList',
  state: [
    {
      name: 'get meat',
      desc: 'get meat from meat shop',
    },
  ],
  reducers: {
    addTodo: (state, payload: { name: string; desc: string }) => [
      ...state,
      payload,
    ],
  },
});

todoList.actions.addTodo({
  name: 'meow',
  desc: 'meow meow',
});

const store = storeInit({
  models: {
    counter,
    counter2,
    todoList,
  },
})
