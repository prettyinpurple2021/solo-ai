'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Rocket, Calendar, CheckCircle } from 'lucide-react';

interface LaunchTask {
  day: number;
  task: string;
  description: string;
  platform: string;
  completed: boolean;
}

export function LiveLaunchTracker() {
  const [launchName, setLaunchName] = useState('');
  const [launchDuration, setLaunchDuration] = useState('7');
  const [launchGoal, setLaunchGoal] = useState('');
  const [tasks, setTasks] = useState<LaunchTask[]>([
    { day: 1, task: 'Announce the launch', description: 'Create excitement and anticipation', platform: 'All platforms', completed: false },
    { day: 2, task: 'Share behind the scenes', description: 'Show the process and build connection', platform: 'Instagram/TikTok', completed: false },
    { day: 3, task: 'Post testimonials', description: 'Social proof and credibility', platform: 'All platforms', completed: false },
    { day: 4, task: 'Address objections', description: 'FAQ content and overcome hesitations', platform: 'Email/Stories', completed: false },
    { day: 5, task: 'Create urgency', description: 'Limited time or bonus offers', platform: 'All platforms', completed: false },
    { day: 6, task: 'Final push', description: 'Last chance messaging', platform: 'Email/Social', completed: false },
    { day: 7, task: 'Launch close', description: 'Thank audience and announce results', platform: 'All platforms', completed: false },
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const addCustomTask = () => {
    const newTask: LaunchTask = {
      day: parseInt(launchDuration) + 1,
      task: 'Custom Task',
      description: 'Add your custom task description',
      platform: 'Your choice',
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (index: number, field: keyof LaunchTask, value: string | boolean) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSave = async () => {
    const templateData = {
      launchName,
      launchDuration,
      launchGoal,
      tasks,
      completedTasks: tasks.filter(task => task.completed).length,
      totalTasks: tasks.length,
      dateCreated: new Date().toISOString(),
    };

    const saveTitle = title || `${launchName || 'Product'} Launch Tracker`;
    
    await saveTemplate('live-launch-tracker', templateData, saveTitle, `${templateData.completedTasks}/${templateData.totalTasks} tasks completed`);
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Launch Tracker</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Briefcase'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="launchName">Launch Name</Label>
            <Input
              id="launchName"
              placeholder="e.g., Course Launch, Product Release"
              value={launchName}
              onChange={(e) => setLaunchName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Launch Duration (Days)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="7"
              value={launchDuration}
              onChange={(e) => setLaunchDuration(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="goal">Launch Goal</Label>
            <Textarea
              id="goal"
              placeholder="e.g., 50 course sales, $10k revenue, 100 new clients"
              value={launchGoal}
              onChange={(e) => setLaunchGoal(e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{completedCount}/{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Launch Timeline</h4>
            <Button variant="outline" size="sm" onClick={addCustomTask}>
              Add Custom Task
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <Card key={index} className={task.completed ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(index)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Day {task.day}</span>
                        <Badge variant="outline">{task.platform}</Badge>
                        {task.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <Input
                        value={task.task}
                        onChange={(e) => updateTask(index, 'task', e.target.value)}
                        className="font-medium border-none p-0 h-auto mt-1"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    className="text-sm border-none p-0 resize-none"
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 