export default function Logo({ compact = false, invert = false }) {
  return (
    <a className={`logo${invert ? ' logo-invert' : ''}${compact ? ' logo-compact' : ''}`} href="#/" aria-label="BÉT!">
      <span className="logo-mark" aria-hidden="true">
        <span className="logo-pip" />
      </span>
      <span className="logo-word">
        BÉT<span className="logo-bang">!</span>
      </span>
    </a>
  )
}
