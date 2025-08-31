import './PhaseSelector.css';

interface PhaseButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function PhaseButton({ label, active, disabled = false, onClick }: PhaseButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 uppercase";
  const activeClasses = "bg-white/90 text-black hover:bg-white";
  const inactiveClasses = disabled ? "bg-black/60 border border-white/30 text-white cursor-not-allowed opacity-50" : "bg-black/60 border border-white/30 text-white hover:bg-white/20 cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface PhaseSelectorProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export default function PhaseSelector({ activePhase, onPhaseChange }: PhaseSelectorProps) {
  return (
    <div className="phase-selector absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
      <div className="phase-controls">
        <PhaseButton label="Proton" active={activePhase === 'proton'} onClick={() => onPhaseChange('proton')} />
        <PhaseButton label="Light Wave" active={activePhase === 'lightwave'} onClick={() => onPhaseChange('lightwave')} />
        <PhaseButton label="Electron" active={activePhase === 'electron'} onClick={() => onPhaseChange('electron')} />
        <PhaseButton label="Add an Observer" active={activePhase === 'observer'} onClick={() => onPhaseChange('observer')} />
      </div>

      <div className="phase-explanation mt-3 p-3 bg-black/60 rounded-md border border-white/10">
        <p className="text-white text-sm leading-relaxed">
          {activePhase === 'proton'
            ? 'Protons pass through two slits, creating random impact points on the screen. Due to their shorter de Broglie wavelength (λ = h / p) from higher mass, interference is absent in this scenario.'
            : activePhase === 'lightwave'
              ? 'Light waves demonstrate the wave nature of light, showing interference patterns when passing through double slits.'
              : activePhase === 'electron'
                ? 'Electrons pass through both slits, as evidenced by the interference pattern on the screen, demonstrating wave-particle duality.'
                : activePhase === 'observer'
                  ? 'Electrons are detected by the observer, causing the wave function to collapse. The interference pattern disappears, showing particle-like behavior with random impact points on the screen.'
                  : 'Select a phase to see the experiment description.'
          }
        </p>
      </div>
    </div>
  );
}