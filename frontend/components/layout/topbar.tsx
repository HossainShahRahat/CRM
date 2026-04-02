type TopbarProps = {
  title: string;
  subtitle: string;
};

export const Topbar = ({ title, subtitle }: TopbarProps) => {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">{title}</h1>
        <p className="topbar__subtitle">{subtitle}</p>
      </div>
      <input
        className="topbar__search"
        type="search"
        placeholder="Search customers, deals, or tasks"
        aria-label="Search"
      />
    </header>
  );
};

