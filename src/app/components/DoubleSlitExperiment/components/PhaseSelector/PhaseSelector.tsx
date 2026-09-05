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
  detectorOn?: boolean;
}

export default function PhaseSelector({ activePhase, onPhaseChange, detectorOn = false }: PhaseSelectorProps) {
  const whichPathExplanation = detectorOn
    ? 'Which-path detector ON: measuring which slit each electron goes through destroys interference. You get a classical mixture of the two single-slit patterns — not because someone “looked,” but because path information exists.'
    : 'Which-path detector OFF: no path information is recorded, so the electron is described by both paths at once and an interference pattern builds on the screen.';

  return (
    <div className="phase-selector" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
      <div className="phase-controls">
        <PhaseButton label="Proton" active={activePhase === 'proton'} onClick={() => onPhaseChange('proton')} />
        <PhaseButton label="Light Wave" active={activePhase === 'lightwave'} onClick={() => onPhaseChange('lightwave')} />
        <PhaseButton label="Electron" active={activePhase === 'electron'} onClick={() => onPhaseChange('electron')} />
        <PhaseButton label="Which-Path" active={activePhase === 'observer'} onClick={() => onPhaseChange('observer')} />
      </div>

      <div className="phase-explanation mt-3 p-3 bg-black/60 rounded-md border border-white/10">
        <p className="text-white text-sm leading-relaxed">
          {activePhase === 'proton'
            ? 'Protons pass through two slits, creating random impact points on the screen. Due to their shorter de Broglie wavelength (λ = h / p) from higher mass, interference is absent in this scenario.'
            : activePhase === 'lightwave'
              ? 'Light waves demonstrate the wave nature of light, showing interference patterns when passing through double slits.'
              : activePhase === 'electron'
                ? detectorOn
                  ? 'Detector measuring path: electrons behave as a classical mixture — interference disappears even though you still fire one electron at a time.'
                  : 'Electrons pass with unknown path, so an interference pattern builds shot-by-shot on the screen — wave-particle duality in action.'
                : activePhase === 'observer'
                  ? whichPathExplanation
                  : 'Select a phase to see the experiment description.'
          }
        </p>
      </div>
    </div>
  );
}
