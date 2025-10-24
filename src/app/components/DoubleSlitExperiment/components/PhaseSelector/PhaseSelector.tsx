import './PhaseSelector.css';

interface PhaseButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function PhaseButton({ label, active, disabled = false, onClick }: PhaseButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-500 uppercase relative overflow-hidden";
  const activeClasses = "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-105";
  const inactiveClasses = disabled
    ? "bg-black/60 border border-white/30 text-white cursor-not-allowed opacity-50"
    : "bg-black/60 border border-white/30 text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-102 cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} phase-button`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="relative z-10">{label}</span>
      {!disabled && !active && (
        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/30 to-pink-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500 shimmer"></span>
      )}
    </button>
  );
}

interface PhaseSelectorProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export default function PhaseSelector({ activePhase, onPhaseChange }: PhaseSelectorProps) {
  return (
    <div className="phase-selector" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
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