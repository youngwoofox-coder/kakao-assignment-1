import PropTypes from 'prop-types';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'completed', label: '완료' },
];

// 상태 필터 탭: 전체 / 진행 중 / 완료
function FilterTabs({ currentFilter, onFilterChange }) {
  return (
    <div className="flex gap-2 bg-white rounded-[12px] p-2 shadow-[0_2px_12px_rgba(103,43,224,0.08)]">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          className={[
            'flex-1 rounded-lg py-2.5 text-[14px] cursor-pointer transition-all border-0',
            currentFilter === key
              ? 'bg-primary text-white font-bold'
              : 'bg-transparent text-muted font-medium hover:bg-page hover:text-body',
          ].join(' ')}
          onClick={() => onFilterChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

FilterTabs.propTypes = {
  currentFilter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterTabs;
