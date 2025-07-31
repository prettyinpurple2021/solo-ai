
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export function DelegationListBuilder() {
  const [tasks, setTasks] = useState<{ text: string, type: string, done: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, type: 'General', done: false }]);
      setNewTask('');
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Enter a task to delegate..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              checked={task.done}
              onCheckedChange={(checked) => {
                const newTasks = [...tasks];
                newTasks[index].done = !!checked;
                setTasks(newTasks);
              }}
            />
            <span>{task.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
