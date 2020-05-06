/* src/App.js */
import React, { useEffect, useState } from 'react'
//import { API, graphqlOperation } from 'aws-amplify'
//import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { DataStore } from '@aws-amplify/datastore'
import { Todo } from './models'
//import { listTodos } from './graphql/queries'
//import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import  CheckboxList from './components/CheckboxList';

const TODAY_DATE = (new Date()).toString();
const EMPTY_COMPLETION_DATE = 'not yet'
const initialState = {
  name: '',
  completed: false,
  description: '', 
  target_date: new Date(), 
  completion_date: EMPTY_COMPLETION_DATE 
}

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => { 
    fetchTodos()
    // Subscription for realtime updates
    const subscription = DataStore.observe(Todo).subscribe(() => fetchTodos())
    return () => subscription.unsubscribe()
  })

  function handleCompleted(event, todo) {
    const completion_date = (event.target.checked)? TODAY_DATE : EMPTY_COMPLETION_DATE
    updateThisTodo({...todo, completed: event.target.checked, completion_date})
  }
  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }
  function setDateValue(key, value) {
    if (!value) value = new Date()
    setStartDate(value)
    setInput(key, value)
  }

  async function fetchTodos() {
    try {
      const todos = await DataStore.query(Todo)
      setTodos(todos)

      // const todoData = await API.graphql(graphqlOperation(listTodos))
      // const todos = todoData.data.listTodos.items
      // setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  //TODO: add @auth to model to save by owner. Info: https://aws-amplify.github.io/docs/cli-toolchain/graphql#auth
  //TODO: fix saving unchanged default dates
  async function addTodo() { 
    try {
      if (!formState.name || !formState.description) return
      console.log({formState})
      await DataStore.save(new Todo({ ...formState, target_date: formState.target_date.toString() }))
      setDateValue('target_date') //resets datepicker to today
      setFormState(initialState)

      // const todo = { ...formState }
      // await API.graphql(graphqlOperation(createTodo, {input: todo}))
      // await fetchTodos() //re-fetch with new ID for added todo
      // setFormState(initialState)
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function updateThisTodo(todo) {
    try {
      const original = await DataStore.query(Todo, todo.id);
      await DataStore.save(
        Todo.copyOf(original, updated => {
          updated.completed = todo.completed;
          updated.completion_date = todo.completion_date;
        })
      );
      // await API.graphql(graphqlOperation(updateTodo, {input: todo}))
      // fetchTodos() //TODO: refresh clientside to prevent a round-trip?
    } catch (err) {
      console.log('error updating todo:', err)
    }
  }

  async function deleteThisTodo(id) {
    try {
      const toDelete = await DataStore.query(Todo, id);
      await DataStore.delete(toDelete);

      // await API.graphql(graphqlOperation(deleteTodo, {input: id}))
      // fetchTodos()
    } catch (err) {
      console.log('error deleting todo:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Todos App with Offline and Realtime Support
      </h2>
      Use 2 browsers windows. Toggle Offline/Online in Dev Tools under Network tab.

      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />

      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />

      <div style={styles.fieldwithlabel}>
        Target Date &nbsp;
        <DatePicker selected={startDate} onChange={date => setDateValue('target_date', date)} placeholderText="Target Date"/>
      </div>

      <button style={styles.button} onClick={addTodo}>Create Todo</button>

      <h2>Current Todos</h2>
      
      <CheckboxList todos={todos} handleCompleted={handleCompleted} handleDelete={deleteThisTodo}></CheckboxList>

    </div>
  )
}

const styles = {
  container: { width: '90vw', margin: '0 auto', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  fieldwithlabel: { border: 'none', backgroundColor: '#ddd', color: '#757575', marginBottom: 10, padding: 8, fontSize: 18 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px', cursor: 'pointer' }
}

export default App