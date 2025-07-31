'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Trash2 } from 'lucide-react';

export function DelegationListBuilder() {
  const [tasks, setTasks] = useState<{ text: string, type: string, done: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, type: 'General', done: false }]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const templateData = {
      tasks,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.done).length,
    };

    const saveTitle = title || `Delegation List (${tasks.length} tasks)`;
    
    await saveTemplate('delegation-list-builder', templateData, saveTitle, `${tasks.filter(task => task.done).length}/${tasks.length} tasks completed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Delegation List Builder</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="Enter a task to delegate..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks yet. Add your first task above!</p>
        ) : (
          tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded">
              <Checkbox
                checked={task.done}
                onCheckedChange={(checked) => {
                  const newTasks = [...tasks];
                  newTasks[index].done = !!checked;
                  setTasks(newTasks);
                }}
              />
              <span className={task.done ? 'line-through text-muted-foreground' : ''}>
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTask(index)}
                className="ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {tasks.filter(task => task.done).length} of {tasks.length} tasks completed
          </div>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save to Briefcase
          </Button>
        </div>
      )}
    </div>
  );
} 