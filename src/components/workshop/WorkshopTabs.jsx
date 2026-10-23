export default function WorkshopTabs({ tabs, activeTab, counts, onChange }) {
  return (
    <div
      className="workshop-tabs"
      role="tablist"
      aria-label="Categorías de entrenamiento"
    >
      {tabs.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={activeTab === category}
          className={`workshop-tab${activeTab === category ? ' active' : ''}`}
          onClick={() => onChange(category)}
        >
          {category}
          <span className="workshop-tab-count">{counts[category] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
