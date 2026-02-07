import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Users, Heart, Shield, Lightbulb, Save } from 'lucide-react';

/**
 * Internal Family Systems (IFS) Journaling component
 * Based on Richard Schwartz's IFS model for self-exploration and healing
 */
export default function IFSJournaling({ userProfile, addSessionToHistory }) {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [responses, setResponses] = useState({});
  const [insights, setInsights] = useState('');

  const partTypes = {
    exile: {
      name: 'Exile',
      description: 'Parts that carry pain, trauma, or unmet needs',
      color: 'bg-red-100 text-red-800',
      icon: Heart,
      examples: ['Inner child', 'Wounded parts', 'Abandoned parts', 'Rejected parts']
    },
    protector: {
      name: 'Protector',
      description: 'Parts that try to prevent pain and keep us safe',
      color: 'bg-blue-100 text-blue-800',
      icon: Shield,
      examples: ['Perfectionist', 'Controller', 'People-pleaser', 'Achiever']
    },
    firefighter: {
      name: 'Firefighter',
      description: 'Parts that react when exiles are triggered',
      color: 'bg-orange-100 text-orange-800',
      icon: Lightbulb,
      examples: ['Rebel', 'Addict', 'Rage', 'Escape artist']
    }
  };

  const journalingPrompts = [
    {
      id: 'meet_your_parts',
      title: 'Meet Your Parts',
      category: 'exploration',
      prompts: [
        {
          question: 'When you think about your fear of authority, which part of you steps forward?',
          followUp: 'Describe this part. How old does it feel? What does it look like? What is it trying to protect you from?'
        },
        {
          question: 'What does this part believe about authority figures?',
          followUp: 'Where did this part learn these beliefs? What experiences shaped this part?'
        },
        {
          question: 'If this part could speak directly to you, what would it say?',
          followUp: 'What does this part need from you? What would help it feel safer?'
        }
      ]
    },
    {
      id: 'self_leadership',
      title: 'Self-Leadership Dialogue',
      category: 'healing',
      prompts: [
        {
          question: 'From your calm, wise Self, what would you like to say to the part that fears authority?',
          followUp: 'How can your Self provide what this part needs? What reassurance can you offer?'
        },
        {
          question: 'What would it look like for your Self to lead in situations with authority figures?',
          followUp: 'How would you act differently if your Self was in charge instead of your fearful part?'
        },
        {
          question: 'What boundaries does your Self want to set to protect your parts?',
          followUp: 'How can you honor both your sovereignty and your connection to others?'
        }
      ]
    },
    {
      id: 'parts_dialogue',
      title: 'Parts Dialogue',
      category: 'integration',
      prompts: [
        {
          question: 'Imagine your fearful part and your confident part having a conversation. What would they say to each other?',
          followUp: 'How can these parts work together instead of against each other?'
        },
        {
          question: 'What would your parts need to feel safe enough to let your Self lead?',
          followUp: 'How can you create internal safety and cooperation among your parts?'
        },
        {
          question: 'If all your parts felt heard and valued, how would you show up in the world?',
          followUp: 'What would change in your relationships and daily life?'
        }
      ]
    },
    {
      id: 'sovereignty_balance',
      title: 'Sovereignty and Connection Balance',
      category: 'integration',
      prompts: [
        {
          question: 'How can you express your sovereignty while still respecting the Self in others?',
          followUp: 'What does healthy sovereignty look like in your relationships?'
        },
        {
          question: 'Which parts of you worry about being too arrogant or too submissive?',
          followUp: 'What would balanced confidence look like for you?'
        },
        {
          question: 'How can your Self model equality - being neither above nor below others?',
          followUp: 'What would change if you truly believed you are equal to all others in fundamental worth?'
        }
      ]
    }
  ];

  const startJournaling = (promptSet) => {
    setCurrentPrompt(promptSet);
    setResponses({});
    setInsights('');
  };

  const updateResponse = (promptIndex, value) => {
    setResponses(prev => ({
      ...prev,
      [promptIndex]: value
    }));
  };

  const saveSession = () => {
    const session = {
      type: 'ifs_journaling',
      promptSet: currentPrompt.title,
      responses,
      insights,
      timestamp: new Date().toISOString()
    };
    
    addSessionToHistory(session);
    setCurrentPrompt(null);
    setResponses({});
    setInsights('');
  };

  const renderPromptSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Understanding Your Internal Parts</span>
          </CardTitle>
          <CardDescription>
            According to IFS theory, we all have different "parts" or subpersonalities within us. 
            These parts developed to help us navigate life, but sometimes they can conflict with each other.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(partTypes).map(([key, type]) => {
              const TypeIcon = type.icon;
              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TypeIcon className="h-5 w-5" />
                    <h3 className="font-semibold">{type.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                  <div className="space-y-1">
                    {type.examples.map(example => (
                      <Badge key={example} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {journalingPrompts.map(promptSet => (
          <Card key={promptSet.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{promptSet.title}</CardTitle>
              <CardDescription>
                {promptSet.category === 'exploration' && 'Explore and understand your internal parts'}
                {promptSet.category === 'healing' && 'Develop Self-leadership and healing'}
                {promptSet.category === 'integration' && 'Integrate parts and find balance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{promptSet.prompts.length} prompts</Badge>
                <Button onClick={() => startJournaling(promptSet)}>
                  Start Journaling
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderActiveJournaling = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{currentPrompt.title}</span>
        </CardTitle>
        <CardDescription>
          Take your time with each prompt. Write freely and let your parts speak through you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentPrompt.prompts.map((prompt, index) => (
            <div key={index} className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Prompt {index + 1}:</h3>
                <p className="text-sm mb-2">{prompt.question}</p>
                <p className="text-xs text-muted-foreground italic">{prompt.followUp}</p>
              </div>
              
              <Textarea
                placeholder="Write your response here..."
                value={responses[index] || ''}
                onChange={(e) => updateResponse(index, e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Session Insights & Reflections</label>
            <Textarea
              placeholder="What insights emerged from this journaling session? What did you learn about your parts?"
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex space-x-3">
            <Button onClick={saveSession} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Session
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPrompt(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internal Family Systems (IFS) Journaling</CardTitle>
          <CardDescription>
            Explore your internal world through the lens of IFS therapy. Connect with your different parts 
            and strengthen your Self-leadership to create internal harmony and external sovereignty.
          </CardDescription>
        </CardHeader>
      </Card>

      {!currentPrompt ? renderPromptSelection() : renderActiveJournaling()}
    </div>
  );
}

