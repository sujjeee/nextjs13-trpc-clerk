"use client"

import { trpc } from '@/app/_trpc/client';
import type { AppRouter } from '@/trpc';
import React, { useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X, Check, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';


type RouterOutput = inferRouterOutputs<AppRouter>

type Todos = RouterOutput['addTodo']

function ToDo() {

  const [todos, setTodos] = useState<Todos[]>([]);
  const [todoText, setTodoText] = useState('');

  const utils = trpc.useContext()

  const [currDelete, setCurrDelete] = useState<number | null>(null)
  const [isAddingTodo, setIsAddingTodo] = useState<number | null>(null)
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
      setCurrDelete(null);
    },
    onError: (error, newTodo) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== newTodo.id));
    },
  })

  const { mutate: addTodo, isLoading: isAdding } = trpc.addTodo.useMutation({
    onMutate: (newTodo) => {
      setIsAddingTodo(0);
      const { text, completed } = newTodo;
      setTodos((prevTodos) => {
        const todoToAdd = {
          id: 0,
          userId: '',
          text,
          completed,
        };

        return [...prevTodos, todoToAdd];
      });
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
      setIsAddingTodo(updatedTodo.id)
      utils.getTodo.invalidate()
    },
    onSettled() {
      setIsAddingTodo(null)
    }
  });

  const { mutate: updateTodo, } = trpc.updateTodo.useMutation({
    onMutate: (updatedTodo) => {
      const currentTodo = todos.find((todo) => todo.id === updatedTodo.id);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTodo.id ? { ...todo, completed: !currentTodo?.completed } : todo
        )
      );
    },
    onSuccess() {
      utils.getTodo.invalidate()
    },
    onSettled() { }
  });



  return (
    < div className='max-w-sm  w-full space-y-4'>
      <div className="flex w-fullitems-center space-x-2">
        <Input
          type="email"
          className='border-primary bg-transparent w-full text-muted-foreground '
          placeholder="type here..."
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <Button
          onClick={() => {
            setTodoText('')
            addTodo({
              text: todoText,
              completed: false
            })
          }}
        >
          {
            !isAdding
              ? "ADD"
              : (
                <Loader2 className='h-4 w-4 cursor-pointer animate-spin' />
              )
          }

        </Button>
      </div>
      <div className='space-y-2'>
        {allTodos && allTodos?.length !== 0 ? (
          <>
            {todos
              .sort((a, b) => a.id - b.id)
              .map((todo, index) => (
                <div
                  key={index}
                  className={cn("relative ml-auto bg-primary text-primary-foreground flex w-full flex-col gap-2 rounded-lg px-3 py-2 text-sm h-9 justify-center",
                    {
                      "bg-primary animate-pulse": !todo.userId
                    }
                  )}>
                  {
                    todo.completed
                      ? (
                        <del className='decoration-2 decoration-green-200'> {todo.text}</del>
                      )
                      : (
                        <>
                          {todo.text}
                        </>
                      )
                  }

                  <div className='absolute right-2.5 -translate-y-2/4 top-2/4 flex gap-4'>
                    {isAddingTodo != todo.id
                      ? (
                        <>
                          <div
                            onClick={() => {
                              updateTodo({
                                id: todo.id,
                                completed: !todo.completed
                              });
                            }}
                          >
                            <Check className='h-4 w-4  text-green-500 hover:text-green-900  cursor-pointer' />
                          </div>
                          <button
                            className='disabled:pointer-events-none disabled:opacity-50'
                            disabled={currDelete !== null && currDelete !== todo.id}
                            onClick={() => deleteTodo({ id: todo.id })}>
                            {
                              currDelete === todo.id
                                ? (
                                  <Loader2 className='h-4 w-4 text-red-500 cursor-pointer animate-spin' />
                                )
                                : (
                                  <X className='h-4 w-4 text-red-500 hover:text-red-900 cursor-pointer' />
                                )
                            }
                          </button>


                        </>
                      )
                      : null
                    }

                  </div>
                </div>
              ))}
          </>
        ) : isLoading ? (
          <div className='space-y-2'>
            <Skeleton className="h-9 w-full bg-primary" />
            <Skeleton className="h-9 w-full bg-primary" />
            <Skeleton className="h-9 w-full bg-primary" />
            <Skeleton className="h-9 w-full bg-primary" />
          </div>
        ) : (
          <div className='text-muted-foreground'>
            <li>hey! add your new todos ✔</li>
          </div>
        )}
      </div>
    </ div >
  );
}

export default ToDo;
