// Signature Tools for each hamster
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SignatureTool, TOOL_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

interface ToolProps {
  onComplete: (result: Record<string, string>) => void;
  color: string;
}

// Belonging Map Tool (Al - Adlerian)
export function BelongingMapTool({ onComplete, color }: ToolProps) {
  const config = TOOL_CONFIG.BelongingMap;
  const [values, setValues] = useState<Record<string, string>>({});

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = config.fields.every((f) => values[f.key]?.trim());

  return (
    <ToolContainer title={config.title} description={config.description} color={color}>
      {config.fields.map((field) => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder={field.placeholder}
            placeholderTextColor={Colors.text.muted}
            value={values[field.key] || ''}
            onChangeText={(text) => updateValue(field.key, text)}
            multiline={field.key === 'action'}
          />
        </View>
      ))}
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: allFilled ? color : Colors.neutral[300] }]}
        onPress={() => allFilled && onComplete(values)}
        disabled={!allFilled}
      >
        <Text style={styles.completeButtonText}>
          {allFilled ? 'Complete Tool' : 'Fill all fields'}
        </Text>
      </TouchableOpacity>
    </ToolContainer>
  );
}

// Chapter Title Tool (Erik - Eriksonian)
export function ChapterTitleTool({ onComplete, color }: ToolProps) {
  const config = TOOL_CONFIG.ChapterTitle;
  const [values, setValues] = useState<Record<string, string>>({});

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = config.fields.every((f) => values[f.key]?.trim());

  return (
    <ToolContainer title={config.title} description={config.description} color={color}>
      {config.fields.map((field) => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder={field.placeholder}
            placeholderTextColor={Colors.text.muted}
            value={values[field.key] || ''}
            onChangeText={(text) => updateValue(field.key, text)}
          />
        </View>
      ))}
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: allFilled ? color : Colors.neutral[300] }]}
        onPress={() => allFilled && onComplete(values)}
        disabled={!allFilled}
      >
        <Text style={styles.completeButtonText}>
          {allFilled ? 'Complete Tool' : 'Fill all fields'}
        </Text>
      </TouchableOpacity>
    </ToolContainer>
  );
}

// Thought Flip Tool (Cogni - CBT)
export function ThoughtFlipTool({ onComplete, color }: ToolProps) {
  const config = TOOL_CONFIG.ThoughtFlip;
  const [values, setValues] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const currentField = config.fields[currentStep];
  const isLastStep = currentStep === config.fields.length - 1;
  const canProceed = values[currentField?.key]?.trim();

  const handleNext = () => {
    if (isLastStep) {
      onComplete(values);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <ToolContainer title={config.title} description={config.description} color={color}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {config.fields.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              idx <= currentStep && { backgroundColor: color },
            ]}
          />
        ))}
      </View>

      <View style={styles.stepIndicator}>
        <Text style={styles.stepNumber}>Step {currentStep + 1} of {config.fields.length}</Text>
      </View>

      {currentField && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{currentField.label}</Text>
          <TextInput
            style={[styles.fieldInput, styles.largeInput]}
            placeholder={currentField.placeholder}
            placeholderTextColor={Colors.text.muted}
            value={values[currentField.key] || ''}
            onChangeText={(text) => updateValue(currentField.key, text)}
            multiline
            textAlignVertical="top"
          />
        </View>
      )}

      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.secondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: canProceed ? color : Colors.neutral[300] },
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Complete' : 'Next'}
          </Text>
          {!isLastStep && <Ionicons name="arrow-forward" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </ToolContainer>
  );
}

// 10-Minute Cut Tool (Rocky - Behavioral Activation)
export function TenMinuteCutTool({ onComplete, color }: ToolProps) {
  const config = TOOL_CONFIG.TenMinuteCut;
  const [physicalStep, setPhysicalStep] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(config.timerDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!physicalStep.trim()) return;

    setTimerActive(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete({ physicalStep, completed: 'true', timeUsed: String(config.timerDuration) });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerActive(false);
    onComplete({
      physicalStep,
      completed: 'partial',
      timeUsed: String(config.timerDuration - seconds),
    });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.timerDuration - seconds) / config.timerDuration) * 100;

  return (
    <ToolContainer title={config.title} description={config.description} color={color}>
      {!timerActive ? (
        <>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>What's the FIRST physical step?</Text>
            <Text style={styles.fieldHint}>
              Not the whole task - just the very first action you can take right now.
            </Text>
            <TextInput
              style={[styles.fieldInput, styles.largeInput]}
              placeholder="e.g., Open the laptop and create a new document"
              placeholderTextColor={Colors.text.muted}
              value={physicalStep}
              onChangeText={setPhysicalStep}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.timerButton,
              { backgroundColor: physicalStep.trim() ? color : Colors.neutral[300] },
            ]}
            onPress={startTimer}
            disabled={!physicalStep.trim()}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.timerButtonText}>Start 10-Minute Timer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>Focus Time</Text>
          <Text style={styles.timerDisplay}>{formatTime(seconds)}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>

          <View style={styles.taskReminder}>
            <Text style={styles.taskReminderLabel}>Your task:</Text>
            <Text style={styles.taskReminderText}>{physicalStep}</Text>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={stopTimer}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.doneButtonText}>Done Early</Text>
          </TouchableOpacity>
        </View>
      )}
    </ToolContainer>
  );
}

// Tool Container wrapper
function ToolContainer({
  title,
  description,
  color,
  children,
}: {
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollView style={styles.toolScroll} contentContainerStyle={styles.toolContent}>
      <View style={[styles.toolContainer, { borderLeftColor: color }]}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolDescription}>{description}</Text>
        {children}
      </View>
    </ScrollView>
  );
}

// Tool Renderer - renders the right tool based on type
export function renderTool(
  toolType: SignatureTool,
  color: string,
  onComplete: (result: Record<string, string>) => void
) {
  switch (toolType) {
    case 'BelongingMap':
      return <BelongingMapTool onComplete={onComplete} color={color} />;
    case 'ChapterTitle':
      return <ChapterTitleTool onComplete={onComplete} color={color} />;
    case 'ThoughtFlip':
      return <ThoughtFlipTool onComplete={onComplete} color={color} />;
    case 'TenMinuteCut':
      return <TenMinuteCutTool onComplete={onComplete} color={color} />;
    default:
      return <Text>Tool not implemented</Text>;
  }
}

const styles = StyleSheet.create({
  toolScroll: {
    flex: 1,
  },
  toolContent: {
    paddingBottom: 40,
  },
  toolContainer: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  toolTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  toolDescription: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  fieldHint: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  fieldInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.text.primary,
    minHeight: 48,
  },
  largeInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  completeButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FontSizes.base,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 4,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  backButtonText: {
    marginLeft: Spacing.xs,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FontSizes.base,
    marginRight: Spacing.xs,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  timerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FontSizes.lg,
    marginLeft: Spacing.sm,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  timerTitle: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: Spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  taskReminder: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  taskReminderLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  taskReminderText: {
    fontSize: FontSizes.base,
    color: Colors.text.primary,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  doneButtonText: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.base,
    color: Colors.success,
    fontWeight: '600',
  },
});
