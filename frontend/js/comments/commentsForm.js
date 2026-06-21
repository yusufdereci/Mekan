let selectedRating = 0;

function initCommentForm() {
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      highlightStars(selectedRating);
    });
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout',  () => highlightStars(selectedRating));
  });

  document.getElementById('submit-comment-btn').addEventListener('click', submitComment);
}

function highlightStars(val) {
  document.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
  });
}

function resetForm() {
  selectedRating = 0;
  highlightStars(0);
  document.getElementById('comment-input').value = '';
  const msg = document.getElementById('comment-msg');
  msg.className = 'comment-msg hidden';
}

async function submitComment() {
  const text  = document.getElementById('comment-input').value.trim();
  const msgEl = document.getElementById('comment-msg');

  if (!selectedRating) {
    showCommentMsg(msgEl, t('selectStar'), 'error');
    return;
  }
  if (text.length < 10) {
    showCommentMsg(msgEl, t('minComment'), 'error');
    return;
  }

  const btn = document.getElementById('submit-comment-btn');
  btn.disabled    = true;
  btn.textContent = '⏳ Submitting...';

  try {
    const data = await API.postComment({
      placeId:   currentPlaceId,
      placeName: currentPlaceName,
      comment:   text,
      rating:    selectedRating
    });

    if (data?.success) {
      showCommentMsg(msgEl, data.message, 'success');
      resetForm();
      if (data.data?.isApproved) {
        showToast('✅ Your review has been published!', 'success');
        loadComments();
      } else {
        showToast('⏳ Your review is under review.', 'info', 4000);
      }
    } else {
      showCommentMsg(msgEl, data?.message || t('commentErr'), 'error');
      showToast('❌ Failed to submit review.', 'error');
    }
  } catch {
    showCommentMsg(msgEl, t('commentErr'), 'error');
    showToast('❌ Could not connect to server.', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = t('sendBtn');
  }
}

function showCommentMsg(el, msg, type) {
  el.textContent = msg;
  el.className   = `comment-msg ${type}`;
}

document.addEventListener('DOMContentLoaded', initCommentForm);
