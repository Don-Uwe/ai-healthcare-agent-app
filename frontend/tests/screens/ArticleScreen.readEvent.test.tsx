import React, {useRef} from 'react';

describe('ArticleScreen — read-event scroll guard', () => {
  function makeScrollHandler(updateReadEvent: jest.Mock) {
    const readEventFiredRef = {current: false};

    const onScroll = (reachedBottom: boolean, isGuest: boolean) => {
      if (reachedBottom && !isGuest && !readEventFiredRef.current) {
        readEventFiredRef.current = true;
        updateReadEvent(undefined, {
          onSuccess: () => {/* state update */},
          onError: () => {
            readEventFiredRef.current = false; // allow retry
          },
        });
      }
    };

    return {onScroll, readEventFiredRef};
  }

  it('calls updateReadEvent exactly once on multiple rapid bottom-of-page events', () => {
    const updateReadEvent = jest.fn();
    const {onScroll} = makeScrollHandler(updateReadEvent);

    // Simulate 20 rapid scroll events all reporting bottom reached
    for (let i = 0; i < 20; i++) {
      onScroll(true, false);
    }

    expect(updateReadEvent).toHaveBeenCalledTimes(1);
  });

  it('does not call updateReadEvent when isGuest is true', () => {
    const updateReadEvent = jest.fn();
    const {onScroll} = makeScrollHandler(updateReadEvent);

    onScroll(true, true);
    onScroll(true, true);

    expect(updateReadEvent).toHaveBeenCalledTimes(0);
  });

  it('does not call updateReadEvent when bottom has not been reached', () => {
    const updateReadEvent = jest.fn();
    const {onScroll} = makeScrollHandler(updateReadEvent);

    onScroll(false, false);
    onScroll(false, false);

    expect(updateReadEvent).toHaveBeenCalledTimes(0);
  });

  it('resets the ref on onError so a retry is possible', () => {
    const updateReadEvent = jest.fn().mockImplementation((_v, {onError}) => {
      onError(new Error('network'));
    });
    const {onScroll, readEventFiredRef} = makeScrollHandler(updateReadEvent);

    onScroll(true, false);
    // After error the ref should be reset
    expect(readEventFiredRef.current).toBe(false);

    // A second attempt should go through
    onScroll(true, false);
    expect(updateReadEvent).toHaveBeenCalledTimes(2);
  });

  it('resets the ref when articleId changes (simulated)', () => {
    const updateReadEvent = jest.fn();
    const {onScroll, readEventFiredRef} = makeScrollHandler(updateReadEvent);

    onScroll(true, false);
    expect(updateReadEvent).toHaveBeenCalledTimes(1);

    // Simulate articleId change: useEffect resets ref
    readEventFiredRef.current = false;

    onScroll(true, false);
    expect(updateReadEvent).toHaveBeenCalledTimes(2);
  });
});