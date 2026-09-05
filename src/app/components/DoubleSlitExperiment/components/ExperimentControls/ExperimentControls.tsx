import './ExperimentControls.css';

interface ExperimentControlsProps {
  activePhase: string;
  detectorOn: boolean;
  onDetectorChange: (on: boolean) => void;
  showPaths: boolean;
  onShowPathsChange: (show: boolean) => void;
  intensity: number;
  onIntensityChange: (value: number) => void;
  shotCount: number;
  showShotControls: boolean;
}

function Toggle({
  label,
  checked,
  onChange,
  onLabel = 'ON',
  offLabel = 'OFF'
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <label className="exp-toggle">
      <span className="exp-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`exp-switch ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
      >
        <span className="exp-switch-knob" />
        <span className="exp-switch-text">{checked ? onLabel : offLabel}</span>
      </button>
    </label>
  );
}

export default function ExperimentControls({
  activePhase,
  detectorOn,
  onDetectorChange,
  showPaths,
  onShowPathsChange,
  intensity,
  onIntensityChange,
  shotCount,
  showShotControls
}: ExperimentControlsProps) {
  const showDetector = activePhase === 'electron' || activePhase === 'observer';

  return (
    <div className="experiment-controls" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
      <p className="path-caption" title="Knowing the path ≠ looking">
        <span className="path-caption-it">sapere il percorso ≠ guardare</span>
        <span className="path-caption-en">knowing the path ≠ looking</span>
      </p>

      <div className="exp-controls-row">
        {showDetector && (
          <Toggle
            label="Which-path detector"
            checked={detectorOn}
            onChange={onDetectorChange}
            onLabel="MEASURE"
            offLabel="OFF"
          />
        )}
        <Toggle
          label="Show paths"
          checked={showPaths}
          onChange={onShowPathsChange}
          onLabel="PATHS"
          offLabel="PATTERN"
        />
      </div>

      {showShotControls && (
        <div className="shot-controls">
          <div className="shot-counter">
            <span className="shot-label">Shots</span>
            <span className="shot-value">{shotCount.toLocaleString()}</span>
          </div>
          <label className="intensity-control">
            <span className="shot-label">Intensity</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={intensity}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              aria-label="Particle intensity"
            />
            <span className="intensity-value">{intensity}</span>
          </label>
        </div>
      )}

      {showDetector && (
        <p className="detector-hint">
          {detectorOn
            ? 'Detector ON — path is measured → classical mixture (no interference).'
            : 'Detector OFF — path unknown → interference pattern.'}
        </p>
      )}
    </div>
  );
}
