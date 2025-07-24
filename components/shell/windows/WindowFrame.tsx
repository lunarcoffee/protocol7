'use client';

import { PropsWithChildren } from 'react';
import { PropsWithWindowInfo } from '../../contexts/WindowManagerContext';
import { useWindowMove } from '@/hooks/windows/useWindowMove';
import { useWindowFocus } from '@/hooks/windows/useWindowFocus';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { ControlButtons } from './ControlButton';
import { ResizeHandles } from './ResizeHandles';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import { motion } from 'motion/react';
import { useToggle } from '@/hooks/useToggle';

const TitleBar = ({ windowInfo }: PropsWithWindowInfo) => {
  const { wid, title, position, hasFocus } = windowInfo;

  const moveWindow = useWindowMove();

  const onWindowDragStart = (initialX: number, initialY: number) =>
    handleMouseDrag(
      { x: initialX, y: initialY },
      (dx, dy) =>
        moveWindow(wid, {
          x: position.x + dx,
          y: position.y + dy,
        }),
      'move',
    );

  return (
    <div
      onMouseDown={(event) => onWindowDragStart(event.clientX, event.clientY)}
      className={twMerge(
        clsx(
          'flex flex-row max-width-[100%] items-center p-1',
          !hasFocus && 'brightness-75 grayscale-50',
        ),
      )}
    >
      <p className="pt-px mr-4 text-sm text-ellipsis text-nowrap overflow-hidden">
        {title}
      </p>
      <div className="grow" />
      <ControlButtons windowInfo={windowInfo} />
    </div>
  );
};

export type WindowFrameProps = PropsWithWindowInfo & PropsWithChildren;

export const WindowFrame = ({ windowInfo, children }: WindowFrameProps) => {
  const { wid, position, zIndex, size, resizable, hasFocus } = windowInfo;

  const focusWindow = useWindowFocus();

  const [isDisappearing, toggleDisappearing] = useToggle(true); // TODO: hacky as hell, dunno how this will interact with minimize/maximize but i just wanted to see the effect first lol
  const motionVariants = {
    hidden: { opacity: 0 },
    opening: {
      transform: 'rotateX(30deg) rotateY(-2deg) scale(0.9) perspective(300px)',
    },
    open: { opacity: 1, transform: 'scale(1)' },
    closing: {
      transform: 'rotateX(-20deg) rotateY(2deg) scale(0.9) perspective(600px)',
    },
  };

  return (
    <motion.div
      onMouseDown={() => focusWindow(wid)}
      className={twMerge(
        clsx(
          'flex flex-col absolute px-1 pb-1 rounded-md bg-gradient-to-tr from-aero-tint-dark/70 to-aero-tint/70 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50 shadow-[0_0_20px] shadow-aero-tint-darkest/75 origin-[50%_-10%]',
          !hasFocus &&
            'from-aero-tint-dark/50 to-aero-tint-dark/50 border-aero-tint-darkest/70 shadow-aero-tint-darkest/40',
          isDisappearing && 'origin-[50%_110%]',
        ),
      )}
      style={{
        top: position.y,
        left: position.x,
        width: size.x,
        height: size.y,
        zIndex,
      }}
      variants={motionVariants}
      initial={['hidden', 'opening']}
      animate="open"
      exit={['hidden', 'closing']}
      transition={{ ease: 'easeOut', duration: 0.06 }}
      onAnimationStart={toggleDisappearing}
    >
      <TitleBar windowInfo={windowInfo} />
      <div className="grow rounded-sm border border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80 overflow-clip">
        {children}
      </div>
      {resizable && <ResizeHandles windowInfo={windowInfo} />}
    </motion.div>
  );
};
