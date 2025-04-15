export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean
  /** What background color to use */
  backgroundColor?: string
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large'
  /** Button contents */
  label: string
  /** Optional click handler */
  onClick?: () => void
}

interface CreateDomProps {
  desc: string
  btnText: string
  onClick: () => void
}

/** Primary UI component for user interaction */
export function createButton({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
}: ButtonProps) {
  const btn = document.createElement('button');
  btn.type = 'button';
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  btn.innerText = label;
  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  btn.className = ['storybook-button', `storybook-button--${size}`, mode].join(' ');

  if (backgroundColor) {
    btn.style.backgroundColor = backgroundColor;
  }

  return btn;
}

export function createDom({ desc, btnText, onClick }: CreateDomProps) {
  const container = document.createElement('div');
  const resContainer = document.createElement('div');

  container.innerHTML = `<p>${desc}</p>`;

  resContainer.style.marginTop = '10px';
  resContainer.style.padding = '15px';


  const btn = createButton({
    label: btnText,
    primary: true,
    size: 'small',
    backgroundColor: '#5b7daf',
    onClick
  });
  container.appendChild(btn);
  container.appendChild(resContainer);
  return {
    dom: container,
    resDom: resContainer,
  };
}
