# Next-Level CLI Onboarding for Claude Task Master - Integration PRD

## Overview

This PRD focuses on enhancing the existing Claude Task Master `init` command with a next-level interactive onboarding experience using Ink. The current system already has a robust foundation with modular architecture, existing UI components (ui.js), and a working initialization flow. This enhancement will transform the basic prompt-based setup into an immersive, visually engaging experience while maintaining backward compatibility.

**Current State**: The existing `task-master init` command uses basic prompts via inquirer to collect project information, then runs separate interactive setups for rules and models configuration.

**Enhancement Goal**: Create a unified, visually stunning onboarding flow that showcases Task Master's capabilities while guiding users through setup with intelligent defaults and real-time validation.

**Integration Approach**: Build upon the existing modular structure in `/scripts/modules/` while preserving all current functionality and command-line flags.

## Core Features (New Components Only)

### 1. Ink-Based UI Layer
**What it does**: Replaces the current inquirer-based prompts with a rich, animated terminal UI built on Ink.

**Why it's important**: Provides visual feedback, progress indication, and a modern CLI experience that matches the sophistication of Task Master itself.

**New components needed**:
- `/scripts/modules/onboarding/` - New directory for Ink components
- `InkAdapter.js` - Bridges existing init flow with new UI
- `OnboardingOrchestrator.js` - Manages the enhanced flow
- `ThemeManager.js` - Consistent visual styling

### 2. Environment Detection Service
**What it does**: Automatically analyzes the project environment before setup begins.

**Why it's important**: Reduces manual input by pre-filling configuration based on detected context.

**New components needed**:
- `/scripts/modules/detection/EnvironmentScanner.js`
- `/scripts/modules/detection/ProjectAnalyzer.js`
- `/scripts/modules/detection/IDEDetector.js`
- Integration with existing `getProjectRoot()` utilities

### 3. Enhanced Model Selection Interface
**What it does**: Upgrades the current `models --setup` flow with visual comparisons and live validation.

**Why it's important**: The current model selection is text-based; users need visual cues to make informed decisions.

**New components needed**:
- `/scripts/modules/onboarding/components/ModelSelector.js`
- `/scripts/modules/onboarding/components/CostCalculator.js`
- `/scripts/modules/validation/APIKeyValidator.js`
- Enhancement to existing `/scripts/modules/models.js`

### 4. Live Tutorial System
**What it does**: Demonstrates Task Master's capabilities by generating a real task during onboarding.

**Why it's important**: Provides immediate value and teaches through hands-on experience.

**New components needed**:
- `/scripts/modules/onboarding/components/LiveDemo.js`
- `/scripts/modules/onboarding/components/TaskPreview.js`
- Integration with existing task generation logic

### 5. Progress Persistence Layer
**What it does**: Allows users to save and resume onboarding if interrupted.

**Why it's important**: Complex setups may take time; users shouldn't lose progress.

**New components needed**:
- `/scripts/modules/onboarding/state/SessionManager.js`
- `/scripts/modules/onboarding/state/ResumeHandler.js`
- `.taskmaster/.onboarding-session` temporary file

## User Experience

### Integration with Existing Flows

**Backward Compatibility**:
- All existing CLI flags (`--yes`, `--name`, `--skip-install`) continue to work
- `--classic` flag to use original inquirer-based flow
- Existing `task-master init` behavior preserved when called programmatically

**Progressive Enhancement**:
1. Detect if terminal supports advanced features
2. Fall back to classic mode if needed
3. Respect existing environment variables and configs

### New User Flows

**Enhanced Interactive Flow**:
```
task-master init
├── Animated welcome with environment detection
├── Smart project configuration (pre-filled from detection)
├── Visual model selection with comparisons
├── API key setup with validation
├── Live task generation demo
├── Workflow customization
└── Completion with next steps
```

**Quick Setup Flow** (new):
```
task-master init --quick
├── Uses all detected defaults
├── Single consolidated form
├── Immediate task generation
└── Complete in < 60 seconds
```

## Technical Architecture

### Integration Points with Existing System

**File Structure Additions**:
```
claude-task-master/
├── scripts/
│   ├── init.js (modify to support new flow)
│   └── modules/
│       ├── ui.js (extend with Ink support)
│       ├── onboarding/ (NEW)
│       │   ├── index.js
│       │   ├── InkAdapter.js
│       │   ├── OnboardingOrchestrator.js
│       │   ├── components/
│       │   │   ├── Welcome.js
│       │   │   ├── ProjectConfig.js
│       │   │   ├── ModelSelector.js
│       │   │   ├── APIKeySetup.js
│       │   │   ├── WorkflowBuilder.js
│       │   │   ├── LiveDemo.js
│       │   │   └── Completion.js
│       │   ├── state/
│       │   │   ├── SessionManager.js
│       │   │   └── OnboardingStore.js
│       │   └── utils/
│       │       ├── animations.js
│       │       └── validators.js
│       └── detection/ (NEW)
│           ├── index.js
│           ├── EnvironmentScanner.js
│           ├── ProjectAnalyzer.js
│           └── IDEDetector.js
```

### Key Integration Requirements

**Existing Module Extensions**:
- `ui.js`: Add `supportsInk()` detection and `useInkUI()` toggle
- `models.js`: Expose model data for visual comparison
- `utils.js`: Add terminal capability detection
- `commands.js`: Register new `--quick` and `--classic` flags

**New Dependencies** (to add to package.json):
```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "ink-gradient": "^3.0.0",
    "ink-spinner": "^5.0.0",
    "ink-select-input": "^6.0.0",
    "ink-text-input": "^6.0.0",
    "ink-table": "^4.0.0",
    "ink-progress-bar": "^4.0.0",
    "@inkjs/ui": "^2.0.0",
    "conf": "^13.0.0"
  }
}
```

### Data Flow Integration

```javascript
// Existing init.js flow
async function init(options) {
  // NEW: Check for Ink support
  if (ui.supportsInk() && !options.classic) {
    return InkAdapter.runEnhancedInit(options);
  }
  
  // Existing inquirer flow continues...
  const answers = await promptProjectDetails(options);
  // ...
}

// New InkAdapter bridges the gap
class InkAdapter {
  static async runEnhancedInit(options) {
    const orchestrator = new OnboardingOrchestrator(options);
    const result = await orchestrator.run();
    
    // Convert Ink results to existing format
    return this.convertToLegacyFormat(result);
  }
}
```

## Development Roadmap

### Phase 1: Foundation Integration (MVP)

**Objective**: Create the Ink infrastructure without breaking existing functionality.

**New Components**:
1. **Ink Setup**
   - Create `/scripts/modules/onboarding/` structure
   - Implement `InkAdapter.js` bridge
   - Add terminal capability detection to `ui.js`
   - Create base Ink component library

2. **Basic Flow Migration**
   - Port project details collection to Ink
   - Maintain compatibility with existing options
   - Add `--classic` flag support
   - Ensure all tests still pass

3. **State Management**
   - Implement `OnboardingStore.js`
   - Add session persistence capability
   - Create resume detection logic

### Phase 2: Smart Features

**Objective**: Add intelligence that enhances the setup experience.

**New Components**:
1. **Detection Services**
   - Implement `EnvironmentScanner.js`
   - Create `ProjectAnalyzer.js` 
   - Build `IDEDetector.js`
   - Integrate with existing project root detection

2. **Enhanced Model Selection**
   - Create visual `ModelSelector.js` component
   - Add `CostCalculator.js` for estimates
   - Build comparison visualization
   - Integrate with existing models.js data

3. **API Validation**
   - Implement `APIKeyValidator.js`
   - Add real-time validation UI
   - Create connection test animations
   - Handle multiple input methods

### Phase 3: Interactive Enhancements

**Objective**: Add engaging features that demonstrate value.

**New Components**:
1. **Live Demo System**
   - Create `LiveDemo.js` component
   - Build `TaskPreview.js` visualization
   - Integrate with task generation
   - Add progress animations

2. **Workflow Builder**
   - Port rules selection to visual interface
   - Add drag-and-drop capability
   - Create template system
   - Build preview functionality

3. **Quick Setup Mode**
   - Implement `--quick` flag handling
   - Create streamlined flow
   - Add smart defaults system
   - Build one-minute setup path

### Phase 4: Polish and Integration

**Objective**: Complete the experience with delightful touches.

**New Components**:
1. **Visual Polish**
   - Add gradient effects and animations
   - Implement smooth transitions
   - Create loading states
   - Add completion celebrations

2. **Help System**
   - Build contextual help overlays
   - Add keyboard shortcut indicators
   - Create inline documentation
   - Implement tutorial mode

3. **IDE Integration**
   - Enhance MCP setup automation
   - Add VS Code extension detection
   - Create configuration generators
   - Build verification system

## Logical Dependency Chain

### Must Maintain (Existing Dependencies)
1. All current CLI commands and flags must continue working
2. Existing module structure and exports must be preserved
3. Current configuration file formats remain unchanged
4. Backward compatibility with programmatic usage

### New Component Build Order
1. **Terminal Detection** → Determines UI capabilities
2. **Ink Adapter Layer** → Bridges new and old systems
3. **Base Components** → Reusable Ink UI elements
4. **State Management** → Handles onboarding flow data
5. **Project Detection** → Gathers environment info
6. **Enhanced UI Flow** → Implements new experience
7. **Validation Systems** → Real-time checks
8. **Demo Integration** → Live task generation
9. **Polish Layer** → Animations and effects

## Risks and Mitigations

### Integration Risks

**Risk**: Breaking existing functionality during enhancement.
- **Mitigation**: Comprehensive test suite before changes; feature flags for gradual rollout; maintain parallel code paths.

**Risk**: Dependency conflicts with existing packages.
- **Mitigation**: Careful version management; test in isolation; use peer dependencies where appropriate.

**Risk**: Performance impact on existing fast init flow.
- **Mitigation**: Lazy load Ink components; quick detection for feature support; optimize bundle size.

### Technical Challenges

**Risk**: Ink compatibility with various terminal emulators.
- **Mitigation**: Robust fallback system; terminal capability detection; graceful degradation.

**Risk**: State management complexity between old and new flows.
- **Mitigation**: Clear adapter pattern; unified data format; comprehensive mapping functions.

### User Experience Risks

**Risk**: Users accustomed to current flow may resist change.
- **Mitigation**: Opt-in by default initially; clear migration path; maintain classic mode permanently.

**Risk**: Increased complexity in troubleshooting.
- **Mitigation**: Enhanced logging; debug mode; clear error messages; separate error paths.

## Appendix

### Existing System Analysis

**Current Init Flow**:
1. `init.js` uses inquirer for prompts
2. Calls `initializeProject()` from modules
3. Runs `rules.interactiveSetup()`
4. Runs `models.interactiveSetup()`
5. Creates project structure
6. Generates configuration files

**Key Files to Modify**:
- `/scripts/init.js` - Add Ink detection and routing
- `/scripts/modules/ui.js` - Extend with Ink support
- `/scripts/modules/commands.js` - Add new flags
- `/bin/task-master.js` - Ensure compatibility

**Existing UI Components**:
- `displayBanner()` - ASCII art display
- `displayHelp()` - Help text formatting
- `displayError()` - Error message formatting
- Various chalk-based formatting functions

### Performance Considerations

**Bundle Size Impact**:
- Ink and dependencies: ~2MB
- Can be lazy-loaded for non-init commands
- Tree-shaking to minimize impact

**Startup Time**:
- Target: < 100ms additional overhead
- Lazy loading for complex components
- Pre-compile Ink components

### Testing Strategy

**New Test Requirements**:
- Ink component unit tests
- Integration tests for both flows
- Terminal compatibility tests
- Performance benchmarks
- E2E tests for complete flows

**Existing Test Preservation**:
- All current tests must pass
- Add parallel test suite for Ink flow
- Regression tests for classic mode