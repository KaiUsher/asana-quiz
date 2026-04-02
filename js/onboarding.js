import { SLIDES } from './icons.js';
import { qs, qsa } from './utils.js';

const ONBOARDING_KEY = 'asana_onboarding_seen';
let currentSlide = 0;

export function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}

export function showOnboarding() {
  currentSlide = 0;
  renderOnboardingSlide(false);
  qs('#onboarding-modal').classList.add('visible');
}

export function hideOnboarding() {
  qs('#onboarding-modal').classList.remove('visible');
  localStorage.setItem(ONBOARDING_KEY, '1');
}

export function advanceOnboarding() {
  if (currentSlide < SLIDES.length - 1) {
    currentSlide++;
    renderOnboardingSlide(true);
  } else {
    hideOnboarding();
  }
}

function renderOnboardingSlide(animate) {
  const slide   = SLIDES[currentSlide];
  const content = qs('#onboarding-content');

  const update = () => {
    qs('#onboarding-icon').innerHTML       = slide.icon;
    qs('#onboarding-heading').textContent  = slide.heading;
    qs('#onboarding-body').textContent     = slide.body;

    qsa('.onboarding-dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentSlide)
    );

    const isLast = currentSlide === SLIDES.length - 1;
    qs('#onboarding-next').textContent         = isLast ? 'Get started' : 'Next';
    qs('#onboarding-skip').style.visibility    = isLast ? 'hidden' : 'visible';
    content.classList.remove('fading');
  };

  if (animate) {
    content.classList.add('fading');
    setTimeout(update, 180);
  } else {
    update();
  }
}
