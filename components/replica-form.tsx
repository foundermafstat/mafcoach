'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReplicaCreateUpdateData, SensayReplica } from '@/app/lib/api/sensay-replicas-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

interface ReplicaFormProps {
  onSubmit: (data: ReplicaCreateUpdateData) => Promise<void>;
  initialData?: SensayReplica;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ReplicaForm({ onSubmit, initialData, onCancel, isLoading }: ReplicaFormProps) {
  const isEditMode = !!initialData;
  
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize form data with default values ensuring all required fields are present
  const defaultLlm = {
    model: 'gpt-4o',
    memoryMode: 'rag-search',
    systemMessage: initialData?.system_message || 'Descriptive, energetic, friendly',
    tools: ['getTokenInfo'] as string[]
  };

  // Получаем ID пользователя из переменных окружения на стороне клиента
  // Обратите внимание, что это доступно только потому, что мы экспортируем NEXT_PUBLIC_SENSAY_USER_ID
  const userId = process.env.NEXT_PUBLIC_SENSAY_USER_ID || 'f676f323-fc10-44a3-8f8d-508b1f9c942f';
  
  const [formData, setFormData] = useState<ReplicaCreateUpdateData>({
    name: initialData?.name || '',
    purpose: initialData?.purpose || '',
    shortDescription: initialData?.shortDescription || initialData?.short_description || '',
    greeting: initialData?.greeting || 'What would you like to know?',
    type: initialData?.type || 'character',
    ownerID: initialData?.ownerID || initialData?.owner_uuid || userId,
    private: initialData?.private ?? false,
    whitelistEmails: initialData?.whitelistEmails || [],
    slug: initialData?.slug || '',
    tags: initialData?.tags || [],
    // Используем надежный URL-изображения по умолчанию, гарантированно доступный через HTTP
    profileImage: initialData?.profileImage || initialData?.profile_image || 'https://placehold.co/400x400/4F46E5/FFFFFF?text=AI+Replica',
    suggestedQuestions: initialData?.suggestedQuestions || [],
    llm: initialData?.llm ? {
      model: initialData.llm.model,
      memoryMode: initialData.llm.memoryMode,
      systemMessage: initialData.llm.systemMessage,
      tools: initialData.llm.tools || []
    } : defaultLlm,
    voicePreviewText: 'Hi, I\'m your Sensay replica! How can I assist you today?'
  });

  const [newTag, setNewTag] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newTool, setNewTool] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.startsWith('llm.')) {
        const llmField = name.split('.')[1];
        return {
          ...prev,
          llm: {
            ...prev.llm,
            [llmField]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handlePrivateChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, private: checked }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      setFormData(prev => ({
        ...prev,
        whitelistEmails: [...(prev.whitelistEmails || []), newEmail.trim()]
      }));
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whitelistEmails: prev.whitelistEmails?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        suggestedQuestions: [...(prev.suggestedQuestions || []), newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggestedQuestions: prev.suggestedQuestions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddTool = () => {
    if (newTool.trim()) {
      setFormData(prev => ({
        ...prev,
        llm: {
          ...prev.llm!,
          tools: [...(prev.llm?.tools || []), newTool.trim()]
        }
      }));
      setNewTool('');
    }
  };

  const handleRemoveTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      llm: {
        ...prev.llm!,
        tools: prev.llm?.tools?.filter((_, i) => i !== index) || []
      }
    }));
  };

  // URL validation
  const isValidHttpUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const validateForm = (): {valid: boolean; error?: string} => {
    // Check required fields
    if (!formData.name.trim()) {
      return { valid: false, error: 'Replica name is required' };
    }
    if (!formData.purpose.trim()) {
      return { valid: false, error: 'Replica purpose is required' };
    }
    if (!formData.shortDescription.trim()) {
      return { valid: false, error: 'Short description is required' };
    }

    // Check profile image URL
    if (!formData.profileImage || !isValidHttpUrl(formData.profileImage)) {
      return { 
        valid: false, 
        error: 'Profile image URL must be a valid HTTP/HTTPS URL' 
      };
    }

    return { valid: true };
  };

  // Define interface for generated content from OpenAI
  interface GeneratedReplicaContent {
    name: string;
    purpose: string;
    shortDescription: string;
    greeting: string;
    systemMessage: string;
    type: string;
    tags: string[];
    suggestedQuestions: string[];
    profileImageDescription?: string;
    modelName: string;
    slug: string;
  }

  // Function to generate slug from replica name
  const generateSlugFromName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Remove duplicate hyphens
      .trim(); // Remove whitespace from edges
  };

  // Generate content using OpenAI based on description
  const generateContent = async () => {
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Enter a description to generate content',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/openai/generate-replica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Error generating content');
      }

      const data = await response.json() as GeneratedReplicaContent;
      
      // Check if default profile image URL is being used
      const isDefaultProfileImage = formData.profileImage === 'https://placehold.co/400x400/4F46E5/FFFFFF?text=AI+Replica';
      
      // Determine name and slug to use
      const nameToUse = data.name || '';
      const slugToUse = data.slug || generateSlugFromName(nameToUse);
      
      // Update form data with generated content
      setFormData(prev => {
        // Create a safe copy of the llm object with required fields
        const updatedLlm = {
          model: data.modelName || 'gpt-4o',
          memoryMode: prev.llm?.memoryMode || 'rag-search',
          systemMessage: data.systemMessage || prev.llm?.systemMessage || 'Descriptive, energetic, friendly',
          tools: prev.llm?.tools || ['getTokenInfo']
        };

        return {
          ...prev,
          // Основные поля
          name: data.name || prev.name,
          purpose: data.purpose || prev.purpose,
          shortDescription: data.shortDescription || prev.shortDescription,
          greeting: data.greeting || prev.greeting,
          // Дополнительные поля
          type: data.type || prev.type,
          slug: slugToUse, // Используем сгенерированный slug
          llm: updatedLlm,
          // Заполняем массивы
          tags: prev.tags && prev.tags.length > 0 ? prev.tags : data.tags || ['ai', 'assistant', 'helper'],
          suggestedQuestions: prev.suggestedQuestions && prev.suggestedQuestions.length > 0 
            ? prev.suggestedQuestions 
            : data.suggestedQuestions || ['Чем ты можешь помочь?', 'Расскажи о себе', 'Какие у тебя возможности?'],
          // Изображение профиля
          profileImage: isDefaultProfileImage ? prev.profileImage : prev.profileImage
        };
      });
      
      // Показываем рекомендацию для изображения профиля
      if (data.profileImageDescription) {
        toast({
          title: 'Image Recommendation',
          description: data.profileImageDescription,
          variant: 'default'
        });
      }

      toast({
        title: 'Success',
        description: 'Content successfully generated',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    
    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScrollArea className="h-[600px] pr-4">
        {/* AI Content Generation */}
        <Card className="mb-4 border-2 border-dashed border-primary/50">
          <CardHeader>
            <CardTitle>AI Content Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Replica Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a basic description of the replica for content generation (example: Financial advisor for beginner investors)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20"
              />
            </div>
            <Button 
              type="button" 
              onClick={generateContent} 
              disabled={isGenerating || !description.trim()}
              variant="outline"
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="llm">LLM Settings</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Replica Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                    className="border-dark-500 bg-dark-400 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Replica Purpose *</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Acts as my AI twin for answering questions about my creative work."
                    required
                    className="min-h-[80px] border-dark-500 bg-dark-400 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="John Smith is a 55 year old accountant from Brooklyn who loves sports and his family."
                    required
                    className="min-h-[80px] border-dark-500 bg-dark-400 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting *</Label>
                  <Input
                    id="greeting"
                    name="greeting"
                    value={formData.greeting}
                    onChange={handleChange}
                    placeholder="What would you like to know?"
                    required
                    className="border-dark-500 bg-dark-400 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Information */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>Advanced Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select 
                    defaultValue={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="border-dark-500 bg-dark-400 text-white">
                      <SelectValue placeholder="Select replica type" />
                    </SelectTrigger>
                    <SelectContent className="border-dark-500 bg-dark-300 text-white">
                      <SelectItem value="character">Character</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="example-replica"
                    className="border-dark-500 bg-dark-400 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image URL *</Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="https://images.invalid/photo.jpeg"
                    className="border-dark-500 bg-dark-400 text-white"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required field. URL must start with http:// or https://
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voicePreviewText">Voice Preview Text</Label>
                  <Input
                    id="voicePreviewText"
                    name="voicePreviewText"
                    value={formData.voicePreviewText}
                    onChange={handleChange}
                    placeholder="Hi, I'm your Sensay replica! How can I assist you today?"
                    className="border-dark-500 bg-dark-400 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="private"
                    checked={formData.private}
                    onCheckedChange={handlePrivateChange}
                  />
                  <Label htmlFor="private">Private Replica</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LLM Settings */}
          <TabsContent value="llm" className="space-y-4">
            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>LLM Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="llm.model">Model *</Label>
                  <Select 
                    defaultValue={formData.llm?.model} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      llm: { ...prev.llm!, model: value } 
                    }))}
                  >
                    <SelectTrigger className="border-dark-500 bg-dark-400 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="border-dark-500 bg-dark-300 text-white">
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="llm.memoryMode">Memory Mode *</Label>
                  <Select 
                    defaultValue={formData.llm?.memoryMode} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      llm: { ...prev.llm!, memoryMode: value } 
                    }))}
                  >
                    <SelectTrigger className="border-dark-500 bg-dark-400 text-white">
                      <SelectValue placeholder="Select memory mode" />
                    </SelectTrigger>
                    <SelectContent className="border-dark-500 bg-dark-300 text-white">
                      <SelectItem value="rag-search">RAG Search</SelectItem>
                      <SelectItem value="window">Window</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="llm.systemMessage">System Message *</Label>
                  <Textarea
                    id="llm.systemMessage"
                    name="llm.systemMessage"
                    value={formData.llm?.systemMessage}
                    onChange={handleChange}
                    placeholder="Concise, knowledgeable, empathetic and cheerful."
                    required
                    className="min-h-[80px] border-dark-500 bg-dark-400 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lists */}
          <TabsContent value="lists" className="space-y-4">
            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="border-dark-500 bg-dark-400 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                    className="bg-mafia-600 hover:bg-mafia-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-dark-400 flex items-center gap-1">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>Allowed Email Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@domain.example"
                    className="border-dark-500 bg-dark-400 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddEmail}
                    className="bg-mafia-600 hover:bg-mafia-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.whitelistEmails?.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-dark-400 p-2 rounded">
                      {email}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEmail(index)}
                        className="hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>Suggested Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What is Mafia Coach?"
                    className="border-dark-500 bg-dark-400 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddQuestion}
                    className="bg-mafia-600 hover:bg-mafia-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.suggestedQuestions?.map((question, index) => (
                    <div key={index} className="flex items-center justify-between bg-dark-400 p-2 rounded">
                      {question}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion(index)}
                        className="hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-dark-500 bg-dark-300 text-white">
              <CardHeader>
                <CardTitle>LLM Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="getTokenInfo"
                    className="border-dark-500 bg-dark-400 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTool}
                    className="bg-mafia-600 hover:bg-mafia-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.llm?.tools?.map((tool, index) => (
                    <Badge key={index} variant="outline" className="bg-dark-400 flex items-center gap-1">
                      {tool}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTool(index)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollArea>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-dark-500 bg-dark-400 text-white"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-mafia-600 hover:bg-mafia-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Save Changes' : 'Create Replica'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
