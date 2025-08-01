'use client';

import { PropsWithChildren } from 'react';
import { PropsWithWindowInfo } from '../../contexts/WindowManagerContext';
import { useWindowFocus } from '@/hooks/windows/useWindowFocus';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { ResizeHandles } from './ResizeHandles';
import { motion } from 'motion/react';
import { useToggle } from '@/hooks/useToggle';
import { TitleBar } from './TitleBar';

export type WindowFrameProps = PropsWithWindowInfo & PropsWithChildren;

export const WindowFrame = ({ windowInfo, children }: WindowFrameProps) => {
  const {
    wid,
    position,
    zIndex,
    size,
    resizable,
    isMaximized,
    isOpen,
    hasFocus,
  } = windowInfo;

  const focusWindow = useWindowFocus();

  const [isDisappearing, toggleDisappearing] = useToggle(true); // TODO: hacky as hell, dunno how this will interact with minimize/maximize but i just wanted to see the effect first lol

  return (
    <motion.div
      onMouseDown={() => focusWindow(wid)}
      className={twMerge(
        clsx(
          'flex flex-col absolute px-1 pb-1 rounded-md bg-gradient-to-tr from-aero-tint-dark/70 to-aero-tint/70 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50 shadow-[0_0_20px] shadow-aero-tint-darkest/75 origin-[50%_-10%]',
          hasFocus ||
            'from-aero-tint-dark/50 to-aero-tint-dark/50 border-aero-tint-darkest/70 shadow-aero-tint-darkest/40',
          isMaximized &&
            'top-0 right-0 bottom-10 left-0 px-0 pb-0 rounded-none inset-shadow-none border-none',
          isDisappearing && 'origin-[50%_110%]',
          isOpen || 'hidden',
        ),
      )}
      style={{
        zIndex,
        ...(!isMaximized && {
          top: position.y,
          left: position.x,
          width: size.x,
          height: size.y,
        }),
      }}
      variants={{
        hidden: { opacity: 0 },
        opening: {
          transform:
            'rotateX(30deg) rotateY(-2deg) scale(0.9) perspective(400px)',
        },
        open: { opacity: 1, transform: 'scale(1)' },
        closing: {
          transform:
            'rotateX(-20deg) rotateY(2deg) scale(0.9) perspective(600px)',
        },
      }}
      initial={['hidden', 'opening']}
      animate="open"
      exit={['hidden', 'closing']}
      transition={{ ease: 'easeOut', duration: 0.06 }}
      onAnimationStart={toggleDisappearing}
    >
      <TitleBar windowInfo={windowInfo} />
      <div
        className={twMerge(
          clsx(
            'grow rounded-sm border border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80 overflow-clip',
            isMaximized &&
              'rounded-none border-0 border-t border-t-aero-tint-darkest/85',
          ),
        )}
      >
        {children}
      </div>
      {resizable && !isMaximized && <ResizeHandles windowInfo={windowInfo} />}
    </motion.div>
  );
};
