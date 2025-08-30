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
  const inactiveClasses = "bg-black/60 border border-white/30 text-white cursor-not-allowed opacity-50";
  
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

export default function PhaseSelector() {
  return (
    <div className="phase-selector absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
      <div className="phase-controls">
        <PhaseButton label="Proton" active={true} />
        <PhaseButton label="Wave" active={false} disabled={true} />
        <PhaseButton label="Electron" active={false} disabled={true} />
        <PhaseButton label="Add an Observer" active={false} disabled={true} />
      </div>

      <div className="phase-explanation mt-3 p-3 bg-black/60 rounded-md border border-white/10">
        <p className="text-white text-sm leading-relaxed">
          Protons are fired towards two slits. Each proton travels through one slit or the other, creating random impact points on the detection screen. However, due to their de Broglie wavelength (λ = h / p), which is shorter for protons due to their higher mass, interference patterns are less pronounced unless their momentum is very low.
        </p>
      </div>
    </div>
  );
}