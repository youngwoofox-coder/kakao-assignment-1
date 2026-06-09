import { useState } from 'react';
import PropTypes from 'prop-types';

// 버튼 공통 스타일 + 색상 변형 조합 헬퍼
const btnBase =
  'rounded-lg px-4 py-2.5 text-[14px] font-semibold cursor-pointer active:scale-[0.97] whitespace-nowrap transition-all border-0 hover:opacity-80';

const btnVariants = {
  done:          'bg-primary-light text-primary',
  undo:          'bg-ghost text-muted',
  edit:          'bg-warning-light text-warning',
  save:          'bg-success-light text-success',
  cancel:        'bg-ghost text-muted',
  delete:        'bg-danger-light text-danger',
  // 삭제 확인 모달 버튼
  confirmDelete: 'bg-danger text-white',
  confirmCancel: 'bg-ghost text-muted',
};

// 개별 Todo 아이템 카드: 완료 토글 / 인라인 수정 / 삭제 (확인 포함)
function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  // 삭제 확인 상태: true이면 "정말 삭제할까요?" 확인 UI로 전환
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setShowDeleteConfirm(false); // 수정 진입 시 삭제 확인 초기화
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleEditKeyDown = (e) => {
    // isComposing: 한글 IME 조합 중이면 Enter를 무시해 이중 저장 방지
    if (e.isComposing) return;
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancelEdit();
  };

  return (
    <li
      className={[
        'bg-white rounded-[12px] px-4 py-3.5 shadow-[0_2px_8px_rgba(103,43,224,0.06)] flex items-center gap-3 transition-opacity list-none',
        todo.completed ? 'opacity-55' : '',
      ].join(' ')}
    >
      {/* ===== 메인 콘텐츠 영역 (flex-1) ===== */}
      {isEditing ? (
        <input
          type="text"
          className="flex-1 border-[1.5px] border-primary rounded-[6px] px-2.5 py-1.5 text-[15px] text-body outline-none"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          autoFocus
        />
      ) : showDeleteConfirm ? (
        <span className="flex-1 text-[14px] text-muted">정말 삭제할까요?</span>
      ) : (
        <span
          className={[
            'flex-1 text-[15px] leading-[1.5] break-words',
            todo.completed ? 'line-through text-subtle' : '',
          ].join(' ')}
        >
          {todo.text}
        </span>
      )}

      {/* ===== 액션 버튼 영역 ===== */}
      <div className="flex gap-1.5 flex-shrink-0">
        {isEditing ? (
          <>
            <button className={`${btnBase} ${btnVariants.save}`} onClick={handleSave}>
              저장
            </button>
            <button className={`${btnBase} ${btnVariants.cancel}`} onClick={handleCancelEdit}>
              취소
            </button>
          </>
        ) : showDeleteConfirm ? (
          <>
            <button
              className={`${btnBase} ${btnVariants.confirmDelete}`}
              onClick={() => onDelete(todo.id)}
            >
              확인
            </button>
            <button
              className={`${btnBase} ${btnVariants.confirmCancel}`}
              onClick={() => setShowDeleteConfirm(false)}
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              className={`${btnBase} ${todo.completed ? btnVariants.undo : btnVariants.done}`}
              onClick={() => onToggle(todo.id)}
            >
              {todo.completed ? '취소' : '완료'}
            </button>
            <button
              className={`${btnBase} ${btnVariants.edit}`}
              onClick={handleStartEdit}
            >
              수정
            </button>
            <button
              className={`${btnBase} ${btnVariants.delete}`}
              onClick={() => setShowDeleteConfirm(true)}
            >
              삭제
            </button>
          </>
        )}
      </div>
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;
