# start-redux

Redux is a predictable state container for JavaScript apps.  
State 를 Component 외부에서 관리할 수 있다.

## Install

```bash
npm install --save redux

npm install --save react-redux
npm install --save-dev redux-devtools
```

## Principles

`Single source of truth`: The state of your whole application is stored in an object tree within a single store.  
`State is read-only`: The only way to change the state is to emit an action, an object describing what happened.  
`Changes are made with pure functions`: To specify how the state tree is transformed by actions, you write pure reducers.

## Concept

### FLUX

![flux](https://velopert.com/wp-content/uploads/2016/04/flux-simple-f8-diagram-with-client-action-1300w.png)

### Action

An action is a plain JavaScript object that describes what happened.

#### Action Creator

functions that create actions.

```js
export const ADD_TODO = 'ADD_TODO';
export const TOGGLE_TODO = 'TOGGLE_TODO';
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE',
};

export function addTodo(text) {
  return { type: ADD_TODO, text };
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index };
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter };
}
```

```js
function addTodo(text) {
  return {
    type: ADD_TODO, // `type` property  필수
    text,
  };
}
dispatch(addTodo(text));
// or
const boundAddTodo = text => dispatch(addTodo(text)); // bound action creator
boundAddTodo(text);
```

### Reducer

Reducers specify how the application's state changes in response to actions sent to the store

> (previousState, action) => newState;

```js
import { combineReducers } from 'redux';

import {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters,
} from './actions';

const { SHOW_ALL } = VisibilityFilters;

const initialState = {
  visibilityFilter: VisibilityFilters.SHOW_ALL,
  todos: [],
};

function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false,
        },
      ];
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return {
            ...todo,
            completed: !todo.completed,
          };
        }
        return todo;
      });
    default:
      return state;
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter;
    default:
      return state;
  }
}

const todoApp = combineReducers({
  visibilityFilter,
  todos,
});

// function todoApp(state = {}, action) {
//   return {
//     visibilityFilter: visibilityFilter(state.visibilityFilter, action),
//     todos: todos(state.todos, actin),
//   };
// }
export default todoApp;
```

### Store

- Holds application state;
- Allows access to state via `getState()`;
- Allows state to be updated via `dispatch(action)`;
- Registers listeners via `subscribe(listener)`;
- Handles `unregistering` of listeners via the function returned by `subscribe(listener)`.

> It's important to note that you'll only have a single store in a Redux application.

```js
import { createStore } from 'redux';
import todoApp from './reducers';
import {
  addTodo,
  toggleTodo,
  setVisibilityFilter,
  VisibilityFilters,
} from './actions';

const store = createStore(todoApp);

const unsubscribe = store.subscribe(() => console.log(store.getState()));

store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(toggleTodo(0));
store.dispatch(toggleTodo(1));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));

unsubscribe();
```

[Redux without React](https://codesandbox.io/s/r5kx9x00mo)

## With React

### Presentational and Container Components

![Presentational and Container Components](./img/Presentational-and-Container-Components.png)

### connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options]) - [connect.js](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js)

`mapStateToProps` describes how to transform the current Redux store state into the props you want to pass to a presentational component you are wrapping

```js
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    case 'SHOW_ALL':
    default:
      return todos
  }
}
​
const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
```

`mapDispatchToProps` receives the dispatch() method and returns callback props that you want to inject into the presentational component.

```js
const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    },
  };
};
```

```js
// connect() is a function that injects Redux-related props into your component.
// You can inject data and callbacks that change that data by dispatching actions.
function connect(mapStateToProps, mapDispatchToProps) {
  // It lets us inject component as the last step so people can use it as a decorator.
  // Generally you don't need to worry about it.
  return function (WrappedComponent) {
    // It returns a component
    return class extends React.Component {
      render() {
        return (
          // that renders your component
          <WrappedComponent
            {/* with its props  */}
            {...this.props}
            {/* and additional props calculated from Redux store */}
            {...mapStateToProps(store.getState(), this.props)}
            {...mapDispatchToProps(store.dispatch, this.props)}
          />
        )
      }

      componentDidMount() {
        // it remembers to subscribe to the store so it doesn't miss updates
        this.unsubscribe = store.subscribe(this.handleChange.bind(this))
      }

      componentWillUnmount() {
        // and unsubscribe later
        this.unsubscribe()
      }

      handleChange() {
        // and whenever the store state changes, it re-renders.
        this.forceUpdate()
      }
    }
  }
}

// This is not the real implementation but a mental model.
// It skips the question of where we get the "store" from (answer: <Provider> puts it in React context)
// and it skips any performance optimizations (real connect() makes sure we don't re-render in vain).

// The purpose of connect() is that you don't have to think about
// subscribing to the store or perf optimizations yourself, and
// instead you can specify how to get props based on Redux store state:

const ConnectedCounter = connect(
  // Given Redux state, return props
  state => ({
    value: state.counter,
  }),
  // Given Redux dispatch, return callback props
  dispatch => ({
    onIncrement() {
      dispatch({ type: 'INCREMENT' })
    }
  })
)(Counter)
```

`Provider`

[Provider.js](https://github.com/reduxjs/react-redux/blob/master/src/components/Provider.js)

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './components/App'
​
const store = createStore(todoApp)
​
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

## Reference

- [Redux](https://redux.js.org/)
- [[번역] 프레젠테이션 컴포넌트와 컨테이너 컴포넌트](https://blueshw.github.io/2017/06/26/presentaional-component-container-component/?no-cache=1)
- [[React.JS] 강좌 10-1 편 Redux: React 앱의 효율적인 데이터 교류](https://velopert.com/1225)
- [컴포넌트에 날개를 달아줘, 리액트 Higher-order Component (HoC)](https://velopert.com/3537)
- [리덕스(Redux)를 왜 쓸까? 그리고 리덕스를 편하게 사용하기 위한 발악 (i)](https://velopert.com/3528)
- [Typechecking With PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html)
