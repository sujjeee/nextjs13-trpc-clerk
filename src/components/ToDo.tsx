"use client"

import { trpc } from '@/app/_trpc/client';
import type { AppRouter } from '@/trpc';
import React, { useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>

type Todos = RouterOutput['addTodo']

function ToDo({ session }: { session: string }) {

  const [todos, setTodos] = useState<Todos[]>([]);
  const [todoText, setTodoText] = useState('');

  const utils = trpc.useContext()

  const [currDelete, setCurrDelete] = useState<number | null>(null)
  const [isAddingTodo, setIsAddingTodo] = useState<boolean>(false)
  const { data: allTodos, isLoading } = trpc.getTodo.useQuery(undefined, {
    onSuccess: (data) => {
      setTodos(data)
    }
  })

  const { mutate: deleteTodo } = trpc.deleteTodo.useMutation({
    onSuccess: () => {
      utils.getTodo.invalidate()
    },
    onMutate({ id }) {
      setCurrDelete(id)
    },
    onSettled() {
      setCurrDelete(null)
    },
    onError: (error, newTodo) => {
      // console.log("deleteTodoError", error)
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== newTodo.id));
    },
  })

  const { mutate: addTodo } = trpc.addTodo.useMutation({
    onMutate: (newTodo) => {
      setIsAddingTodo(true);
      const { text, completed } = newTodo;
      const todoToAdd: Todos = {
        id: 0,
        userId: '',
        text,
        completed,
      };

      setTodos([...todos, todoToAdd]);

      return todoToAdd;
    },
    onSuccess: (updatedTodo) => {
      setTodos((prevTodos) => prevTodos.map((todo) => {
        if (todo.id === 0 && todo.userId === '') {
          return {
            ...updatedTodo,
          };
        }
        return todo;
      }));
      utils.getTodo.invalidate()
    },
    onSettled() {
      setIsAddingTodo(false)
    }
  });

  return (
    <div className='flex flex-col space-y-3'>
      <div className='relative justify-center items-center flex h-full overflow-hidden'>
        <input
          className="shadow overflow-hidden appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="type here"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        // Handle "Enter" key press
        />
        <button
          onClick={() => {
            setTodoText('')
            addTodo({
              text: todoText,
              completed: false
            })
          }}
          className="absolute bg-blue-500 top-0 right-0 justify-center items-center flex h-full px-4 rounded-r"
        >
          {
            isAddingTodo
              ? "0"
              : "ADD"
          }
        </button>
      </div>
      {allTodos && allTodos?.length !== 0 ? (
        <>
          {todos.map((todo, index) => (
            <div key={index}
              className={`text-base px-3 py-1 rounded-md border break-words flex justify-between items-center ${!todo.userId ? 'bg-red-600 animate-pulse' : ''
                }`}
            >
              {todo.text}
              <div
                onClick={() => deleteTodo({ id: todo.id })}
                className='cursor-pointer hover:text-red-600 p-2'>
                {
                  currDelete === todo.id
                    ? "0"
                    : "x"
                }
              </div>
            </div>
          ))}
        </>
      ) : isLoading ? (
        <div>loading...</div>
      ) : (
        <div>No Todo to Show!</div>
      )}
    </div>
  );
}

export default ToDo;
