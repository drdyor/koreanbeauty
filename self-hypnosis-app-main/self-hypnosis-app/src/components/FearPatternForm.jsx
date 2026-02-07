import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { fearPatterns, getAllTriggers, getFearPatternsByTriggers } from '../utils/fearPatterns.js';

/**
 * Component for identifying fear patterns based on triggers
 * @param {object} props - Component props
 * @param {object} props.userProfile - Current user profile
 * @param {function} props.addFearPattern - Function to add fear pattern to profile
 * @param {function} props.onComplete - Callback when analysis is complete
 */
export default function FearPatternForm({ userProfile, addFearPattern, onComplete }) {
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const allTriggers = getAllTriggers();

  const handleTriggerToggle = (trigger) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleAnalyze = async () => {
    if (selectedTriggers.length === 0) return;

    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const matchedPatterns = getFearPatternsByTriggers(selectedTriggers);
    
    // Score patterns based on trigger overlap
    const scoredPatterns = matchedPatterns.map(pattern => {
      const matchingTriggers = pattern.triggers.filter(trigger => 
        selectedTriggers.includes(trigger)
      );
      const score = (matchingTriggers.length / pattern.triggers.length) * 100;
      
      return {
        ...pattern,
        matchingTriggers,
        score: Math.round(score)
      };
    }).sort((a, b) => b.score - a.score);

    setAnalysisResults(scoredPatterns);
    setIsAnalyzing(false);
  };

  const handleAddPattern = (patternId) => {
    addFearPattern(patternId);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(analysisResults);
    }
    setSelectedTriggers([]);
    setAnalysisResults(null);
  };

  const renderTriggerSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Fear Pattern Analysis</span>
        </CardTitle>
        <CardDescription>
          Select the triggers or situations that cause you stress, anxiety, or discomfort. 
          This will help identify underlying fear patterns based on Chase Hughes' Behavioral Table of Elements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {allTriggers.map(trigger => (
            <div key={trigger} className="flex items-center space-x-2">
              <Checkbox
                id={trigger}
                checked={selectedTriggers.includes(trigger)}
                onCheckedChange={() => handleTriggerToggle(trigger)}
              />
              <label 
                htmlFor={trigger}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {trigger}
              </label>
            </div>
          ))}
        </div>
        
        {selectedTriggers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Selected triggers:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTriggers.map(trigger => (
                <Badge key={trigger} variant="secondary">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleAnalyze}
          disabled={selectedTriggers.length === 0 || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing Patterns...' : 'Analyze Fear Patterns'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAnalysisResults = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Analysis Results</span>
        </CardTitle>
        <CardDescription>
          Based on your selected triggers, here are the fear patterns that may be affecting you:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysisResults.map(pattern => (
            <div key={pattern.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pattern.name}</h3>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={pattern.score >= 70 ? "destructive" : pattern.score >= 40 ? "default" : "secondary"}>
                    {pattern.score}% match
                  </Badge>
                  {!userProfile.fearPatterns.includes(pattern.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleAddPattern(pattern.id)}
                    >
                      Add to Profile
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Added
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Matching triggers:</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.matchingTriggers.map(trigger => (
                    <Badge key={trigger} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>

              {pattern.score >= 40 && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    <strong>Recommendation:</strong> This pattern shows significant relevance to your triggers. 
                    Consider adding it to your profile for personalized therapeutic interventions.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button onClick={handleComplete} className="flex-1">
            Complete Analysis
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setAnalysisResults(null)}
          >
            Analyze Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {!analysisResults ? renderTriggerSelection() : renderAnalysisResults()}
    </div>
  );
}

