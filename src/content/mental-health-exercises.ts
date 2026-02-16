/**
 * Mental Health Exercise Content
 *
 * Evidence-based self-help exercises sourced from:
 * - VA PTSD Coach mobile app techniques
 * - DoD Center for Deployment Psychology
 * - National Center for PTSD public resources
 *
 * All content written at 6th-8th grade reading level.
 */

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: string[];
  source: string;
  tip: string;
}

export interface ExerciseTopic {
  slug: string;
  name: string;
  description: string;
  icon: string;
  exercises: Exercise[];
}

export const mentalHealthExercises: ExerciseTopic[] = [
  {
    slug: "ptsd",
    name: "PTSD Management",
    description: "Exercises to help you manage PTSD symptoms and feel more grounded in the present moment.",
    icon: "Shield",
    exercises: [
      {
        id: "grounding-5-4-3-2-1",
        title: "Grounding Exercise (5-4-3-2-1)",
        description: "This exercise uses your five senses to bring you back to the present moment when you feel overwhelmed or triggered.",
        duration: "5 minutes",
        steps: [
          "Take a slow, deep breath.",
          "Look around and name 5 things you can see. Say them out loud or in your mind.",
          "Notice 4 things you can touch. Feel the texture of your clothes, the chair, or a nearby object.",
          "Listen for 3 sounds you can hear. Pay attention to sounds near and far.",
          "Identify 2 things you can smell. If you can't smell anything, name your two favorite scents.",
          "Notice 1 thing you can taste. Take a sip of water or recall the taste of your last meal.",
          "Take another slow breath and notice how you feel."
        ],
        source: "Adapted from VA PTSD Coach",
        tip: "Use this exercise anytime you feel anxious, triggered, or disconnected. You can do it anywhere, even in public."
      },
      {
        id: "box-breathing",
        title: "Box Breathing",
        description: "A simple breathing pattern that calms your nervous system and reduces stress. Used by military personnel in high-pressure situations.",
        duration: "5-10 minutes",
        steps: [
          "Sit comfortably with your feet flat on the floor.",
          "Close your eyes or look at a spot on the floor.",
          "Breathe in slowly through your nose for 4 counts.",
          "Hold your breath for 4 counts.",
          "Breathe out slowly through your mouth for 4 counts.",
          "Hold your breath for 4 counts.",
          "Repeat this pattern 5 to 10 times.",
          "Return to normal breathing when you're done."
        ],
        source: "Adapted from DoD breathing techniques",
        tip: "If 4 counts feels too long, try 3 counts. The steady rhythm is more important than the exact count."
      },
      {
        id: "progressive-muscle-relaxation",
        title: "Progressive Muscle Relaxation",
        description: "Tense and relax different muscle groups to release physical tension and calm your mind.",
        duration: "10-15 minutes",
        steps: [
          "Lie down or sit in a comfortable chair.",
          "Take three slow, deep breaths.",
          "Tense your feet by curling your toes tightly. Hold for 5 seconds, then relax.",
          "Tense your leg muscles by squeezing your thighs. Hold for 5 seconds, then relax.",
          "Tense your stomach by pulling it in tight. Hold for 5 seconds, then relax.",
          "Make fists with your hands and tense your arms. Hold for 5 seconds, then relax.",
          "Shrug your shoulders up toward your ears. Hold for 5 seconds, then relax.",
          "Squeeze your face muscles by scrunching your eyes and mouth. Hold for 5 seconds, then relax.",
          "Take three more slow breaths and notice the difference in your body."
        ],
        source: "Adapted from VA PTSD Coach",
        tip: "Focus on the difference between tension and relaxation. This helps you recognize when you're holding stress in your body."
      },
      {
        id: "safe-place-visualization",
        title: "Safe Place Visualization",
        description: "Picture a calm, safe place in your mind to help reduce anxiety and create a sense of peace.",
        duration: "5-10 minutes",
        steps: [
          "Sit or lie down in a quiet space.",
          "Close your eyes and take three slow breaths.",
          "Picture a place where you feel completely safe and calm. This could be a beach, a forest, a favorite room, or an imaginary place.",
          "Notice what you see in this place. What colors, shapes, and objects are around you?",
          "Notice what you hear. Are there birds, waves, or quiet?",
          "Notice what you feel. Is there warmth from the sun, a cool breeze, or soft textures?",
          "Stay in this place for a few minutes. Breathe slowly and enjoy the feeling of safety.",
          "When you're ready, open your eyes and return to the present."
        ],
        source: "Adapted from VA PTSD Coach",
        tip: "You can return to this safe place in your mind anytime you need comfort. The more you practice, the easier it becomes."
      }
    ]
  },
  {
    slug: "anxiety",
    name: "Anxiety Relief",
    description: "Techniques to calm your mind, slow down racing thoughts, and manage everyday anxiety.",
    icon: "Heart",
    exercises: [
      {
        id: "belly-breathing",
        title: "Belly Breathing",
        description: "Slow, deep breathing from your belly instead of your chest. This activates your body's natural calm response.",
        duration: "5-10 minutes",
        steps: [
          "Sit or lie down in a comfortable position.",
          "Place one hand on your chest and one hand on your belly.",
          "Breathe in slowly through your nose. Your belly should rise, but your chest should stay still.",
          "Breathe out slowly through your mouth. Your belly should fall.",
          "Continue breathing this way for 5 to 10 minutes.",
          "Focus on the rise and fall of your belly with each breath."
        ],
        source: "Adapted from VA relaxation techniques",
        tip: "If your chest keeps moving, try lying down. Gravity makes belly breathing easier when you're flat on your back."
      },
      {
        id: "body-scan",
        title: "Body Scan Relaxation",
        description: "Pay attention to each part of your body to notice tension and let it go.",
        duration: "10-15 minutes",
        steps: [
          "Lie down on your back with your arms at your sides.",
          "Close your eyes and take three slow breaths.",
          "Focus on your feet. Notice any tension or tightness. Breathe into that area and let it relax.",
          "Move your attention to your legs. Notice, breathe, and relax.",
          "Continue moving up your body: hips, stomach, chest, arms, shoulders, neck, and face.",
          "Spend about 30 seconds on each body part.",
          "If your mind wanders, gently bring it back to the body part you're focusing on.",
          "When you reach your head, take three more slow breaths and notice how your whole body feels."
        ],
        source: "Adapted from VA mindfulness resources",
        tip: "Don't worry if you fall asleep during this exercise. That means your body needed rest."
      },
      {
        id: "thought-challenging",
        title: "Thought Challenging",
        description: "Write down your worries and test if they are facts or just anxious thoughts. This helps you gain perspective.",
        duration: "10-15 minutes",
        steps: [
          "Get a piece of paper and pen.",
          "Write down the worry or fear that's bothering you.",
          "Ask yourself: Is this thought a fact, or is it just a fear?",
          "Write down evidence that supports your worry.",
          "Write down evidence that goes against your worry.",
          "Ask yourself: What would I tell a friend who had this worry?",
          "Write down a more balanced thought to replace the original worry.",
          "Notice how you feel after challenging the thought."
        ],
        source: "Adapted from cognitive-behavioral therapy techniques",
        tip: "Most of our worries never actually happen. Writing them down helps you see them more clearly."
      },
      {
        id: "mindful-walking",
        title: "Mindful Walking",
        description: "Walk slowly and pay attention to each step. This combines movement with mindfulness to reduce anxiety.",
        duration: "10-20 minutes",
        steps: [
          "Find a quiet place to walk, indoors or outdoors.",
          "Start walking at a slow, comfortable pace.",
          "Notice the feeling of your feet touching the ground with each step.",
          "Pay attention to how your legs move and your arms swing.",
          "Notice what you see, hear, and smell around you.",
          "If your mind wanders to worries, gently bring your focus back to your steps.",
          "Continue walking and noticing for 10 to 20 minutes.",
          "When you finish, take three deep breaths and notice how you feel."
        ],
        source: "Adapted from mindfulness-based stress reduction",
        tip: "You don't need a special place to do this. Even walking around your living room slowly and mindfully can help."
      }
    ]
  },
  {
    slug: "sleep",
    name: "Sleep Improvement",
    description: "Strategies to help you fall asleep faster, stay asleep longer, and wake up feeling more rested.",
    icon: "Moon",
    exercises: [
      {
        id: "sleep-hygiene",
        title: "Sleep Hygiene Checklist",
        description: "Simple habits that make it easier for your body and brain to fall asleep and stay asleep.",
        duration: "Ongoing daily practice",
        steps: [
          "Go to bed and wake up at the same time every day, even on weekends.",
          "Keep your bedroom cool, dark, and quiet.",
          "Stop looking at phones, tablets, and computers 1 hour before bed.",
          "Avoid caffeine after 2 PM.",
          "Don't drink alcohol close to bedtime. It might help you fall asleep but wakes you up later.",
          "Get some sunlight or bright light during the day. This helps your body clock.",
          "Exercise during the day, but not within 3 hours of bedtime.",
          "Use your bed only for sleep. Don't work, eat, or watch TV in bed."
        ],
        source: "Adapted from VA sleep guidelines",
        tip: "You don't have to do all of these perfectly. Pick two or three to start with and build from there."
      },
      {
        id: "wind-down-routine",
        title: "Wind-Down Routine",
        description: "A calming routine before bed signals to your brain that it's time to sleep.",
        duration: "30-60 minutes before bed",
        steps: [
          "Set an alarm for 1 hour before your target bedtime.",
          "Turn off all screens (TV, phone, computer).",
          "Dim the lights in your home.",
          "Do something relaxing: read a book, listen to calm music, or take a warm bath.",
          "Avoid difficult conversations or stressful topics.",
          "Try a relaxation exercise like belly breathing or progressive muscle relaxation.",
          "When it's time for bed, go to your bedroom.",
          "Do the same routine every night so your body learns the pattern."
        ],
        source: "Adapted from sleep medicine best practices",
        tip: "The routine matters more than what you do. Consistency teaches your brain that these actions mean sleep is coming."
      },
      {
        id: "stimulus-control",
        title: "Stimulus Control for Sleep",
        description: "Train your brain to associate your bed with sleep, not with being awake and frustrated.",
        duration: "Use as needed",
        steps: [
          "Only go to bed when you feel sleepy, not just tired.",
          "If you can't fall asleep after 20 minutes, get out of bed.",
          "Go to another room and do something boring in dim light. Don't check your phone.",
          "Return to bed only when you feel sleepy again.",
          "If you still can't sleep after 20 minutes, get up again.",
          "Repeat as many times as needed throughout the night.",
          "Set your alarm for the same time every morning, no matter how much you slept.",
          "Don't nap during the day, even if you're tired."
        ],
        source: "Adapted from cognitive behavioral therapy for insomnia (CBT-I)",
        tip: "This might feel hard at first, but it retrains your brain to fall asleep faster. Most people see improvement in 1-2 weeks."
      },
      {
        id: "worry-journal",
        title: "Worry Journal",
        description: "Write down your worries before bed so your mind can let them go for the night.",
        duration: "10 minutes before bed",
        steps: [
          "Keep a notebook and pen on your nightstand.",
          "About 30 minutes before bed, write down anything you're worried about.",
          "Write down tasks you need to remember for tomorrow.",
          "For each worry, write one small action you can take tomorrow (or write 'nothing I can do tonight').",
          "Close the notebook and say to yourself, 'I'll deal with this tomorrow.'",
          "If worries come up when you're in bed, remind yourself you already wrote them down.",
          "You can review your journal in the morning and take action then."
        ],
        source: "Adapted from sleep therapy techniques",
        tip: "Your brain worries to make sure you don't forget important things. Writing them down proves you won't forget, so your brain can relax."
      }
    ]
  },
  {
    slug: "anger",
    name: "Anger Management",
    description: "Tools to help you cool down when you're angry, respond instead of react, and communicate without conflict.",
    icon: "Flame",
    exercises: [
      {
        id: "timeout-technique",
        title: "Timeout Technique",
        description: "Step away from a heated situation before you say or do something you regret. Take a break and cool down.",
        duration: "15-30 minutes",
        steps: [
          "Notice the early signs that you're getting angry: heart racing, jaw clenching, or a hot feeling.",
          "Say calmly, 'I need to take a break' or 'I need some time to cool down.'",
          "Leave the situation. Go to another room or take a walk.",
          "Don't use this time to keep thinking about what made you angry.",
          "Do something to calm down: deep breathing, a walk, or listening to music.",
          "Wait at least 15 minutes before going back to the situation.",
          "When you return, you'll be calmer and better able to talk about the problem."
        ],
        source: "Adapted from anger management programs",
        tip: "Taking a timeout is not avoiding the problem. It's making sure you handle the problem in a way you'll be proud of later."
      },
      {
        id: "breathing-for-anger",
        title: "Deep Breathing for Anger",
        description: "Slow down your breathing to calm your body's anger response. This works because anger speeds up your heart, and slow breathing slows it back down.",
        duration: "5 minutes",
        steps: [
          "Notice that you're feeling angry.",
          "Stop what you're doing if possible.",
          "Place one hand on your belly.",
          "Breathe in slowly through your nose for 4 counts.",
          "Hold for 2 counts.",
          "Breathe out very slowly through your mouth for 6 counts. Make the exhale longer than the inhale.",
          "Repeat this pattern 10 times.",
          "Notice how your body feels calmer."
        ],
        source: "Adapted from stress management techniques",
        tip: "The long, slow exhale is the most important part. It activates your body's calm response."
      },
      {
        id: "physical-release",
        title: "Physical Activity Release",
        description: "Use physical movement to burn off angry energy in a healthy way instead of taking it out on people.",
        duration: "10-20 minutes",
        steps: [
          "When you feel angry, channel that energy into movement.",
          "Go for a fast walk or a jog.",
          "Do push-ups, jumping jacks, or other exercises.",
          "Hit a punching bag or pillow (not a person or wall).",
          "Do yard work, clean your house, or organize a space.",
          "Focus on the physical movement, not on what made you angry.",
          "Continue until you feel your body start to relax.",
          "After the physical activity, take a few minutes to breathe slowly."
        ],
        source: "Adapted from anger management programs",
        tip: "Anger creates energy in your body. Physical activity is a healthy way to release that energy so it doesn't come out in harmful ways."
      },
      {
        id: "assertive-communication",
        title: "Assertive Communication",
        description: "Express your feelings and needs in a calm, clear way instead of yelling, blaming, or shutting down.",
        duration: "Use during conversations",
        steps: [
          "Take a few deep breaths before you speak.",
          "Use 'I feel' statements instead of 'You always' or 'You never.'",
          "Example: Say 'I feel frustrated when plans change' instead of 'You always cancel on me.'",
          "State the specific behavior that bothered you, not the person's character.",
          "Example: Say 'When you interrupt me' instead of 'You're so rude.'",
          "Say what you need clearly: 'I need you to listen when I'm talking.'",
          "Keep your voice calm and steady, even if the other person gets upset.",
          "If you start to feel too angry, take a timeout and come back later."
        ],
        source: "Adapted from assertiveness training",
        tip: "Assertive communication is not about winning an argument. It's about expressing yourself clearly while respecting the other person."
      }
    ]
  }
];
