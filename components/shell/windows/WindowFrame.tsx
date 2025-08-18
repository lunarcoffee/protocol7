'use client';

import { motion } from 'motion/react';
import { PropsWithChildren } from 'react';

import { useToggle } from '@/hooks/useToggle';
import { useWindowFocus } from '@/hooks/windows/useWindowFocus';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { PropsWithWindowInfo } from '../../contexts/WindowManagerContext';
import { ResizeHandles } from './ResizeHandles';
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
      className={twMergeClsx(
        `
          absolute flex origin-[50%_-10%] flex-col rounded-md border
          border-aero-tint-darkest/85 bg-gradient-to-tr from-aero-tint-dark/70
          to-aero-tint/70 px-1 pb-1 shadow-[0_0_20px] inset-shadow-[0_0_2px]
          shadow-aero-tint-darkest/75 inset-shadow-white/80 backdrop-blur-xs
          text-shadow-aero-tint-darkest/50 text-shadow-md
        `,
        hasFocus ||
          `
            border-aero-tint-darkest/70 from-aero-tint-dark/50
            to-aero-tint-dark/50 shadow-aero-tint-darkest/40
          `,
        isMaximized &&
          `
            top-0 right-0 bottom-10 left-0 rounded-none border-none px-0 pb-0
            inset-shadow-none
          `,
        isDisappearing && 'origin-[50%_110%]',
        isOpen || 'hidden',
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
      {/* glass reflections */}
      <div className="absolute top-0 left-0 z-0 h-2/5 w-full overflow-clip">
        <div
          className={`
            absolute top-0 left-1/4 h-[200%] w-1/5 origin-top-left -rotate-20
            bg-gradient-to-r from-transparent via-white/5 via-[3px]
            to-transparent
          `}
        />
        <div
          className={`
            absolute top-0 left-1/2 h-[200%] w-[max(2rem,8%)] origin-top-left
            -rotate-20 bg-white/5 shadow-[0_0_3px] shadow-white/10
          `}
        />
        {size.x > 300 && size.y > 200 && (
          <>
            <div
              className={`
                absolute top-0 left-2/3 h-[200%] w-1/3 origin-top-left
                -rotate-20 bg-gradient-to-r from-transparent via-white/10
                via-[3px] to-transparent
              `}
            />
            {/* horizontal upwards edge */}
            <motion.div
              className={`
                absolute bottom-0 left-0 z-0 h-1/3 w-full bg-gradient-to-t
                from-transparent via-white/40 via-[2px] to-transparent
              `}
            />
          </>
        )}
      </div>
      <div
        className={twMergeClsx(
          `
            z-20 grow overflow-clip rounded-sm border
            border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80
          `,
          isMaximized &&
            'rounded-none border-0 border-t border-t-aero-tint-darkest/85',
        )}
      >
        {children}
      </div>
      {resizable && !isMaximized && <ResizeHandles windowInfo={windowInfo} />}
    </motion.div>
  );
};
