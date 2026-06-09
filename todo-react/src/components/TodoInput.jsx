import { useState } from 'react';
import PropTypes from 'prop-types';

// 할 일 입력 카드: 텍스트 입력 + 추가 버튼 + 입력 검증 메시지
function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  const [showError, setShowError] = useState(false);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onAdd(trimmed);
    setText('');
  };

  const handleChange = (e) => {
    setText(e.target.value);
    // 입력이 생기면 에러 메시지 즉시 숨김
    if (e.target.value.trim()) setShowError(false);
  };

  const handleKeyDown = (e) => {
    // isComposing: 한글 IME 조합 중이면 Enter를 무시해 이중 제출 방지
    if (e.isComposing) return;
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white rounded-[14px] p-5 shadow-[0_2px_12px_rgba(103,43,224,0.08)] flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <input
          type="text"
          className="flex-1 border-[1.5px] border-input rounded-lg px-3.5 py-2.5 text-[15px] text-body outline-none focus:border-primary transition-colors"
          placeholder="할 일을 입력하세요"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-primary text-white rounded-lg px-4 py-2.5 text-[14px] font-semibold cursor-pointer hover:opacity-[0.88] active:scale-[0.97] whitespace-nowrap transition-all border-0"
          onClick={handleAdd}
        >
          추가
        </button>
      </div>
      {showError && (
        <p className="text-[13px] text-danger">할 일 내용을 입력해 주세요.</p>
      )}
    </div>
  );
}

TodoInput.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default TodoInput;
