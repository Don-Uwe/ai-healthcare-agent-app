import {mergeNotificationsById} from './notificationUtils';

const notification = (id: string, title = id) =>
  ({_id: id, title}) as any;

describe('mergeNotificationsById', () => {
  it('returns an empty list when both pages are empty', () => {
    expect(mergeNotificationsById([], [])).toEqual([]);
  });

  it('preserves the order of unique notifications', () => {
    expect(
      mergeNotificationsById(
        [notification('1'), notification('2')],
        [notification('3')],
      ).map(item => item._id),
    ).toEqual(['1', '2', '3']);
  });

  it('deduplicates IDs and keeps the latest server value', () => {
    expect(
      mergeNotificationsById(
        [notification('1', 'old title'), notification('2')],
        [notification('1', 'updated title')],
      ),
    ).toEqual([
      notification('1', 'updated title'),
      notification('2'),
    ]);
  });

  it('deduplicates repeated entries within the incoming page', () => {
    expect(
      mergeNotificationsById(
        [],
        [notification('1', 'first'), notification('1', 'second')],
      ),
    ).toEqual([notification('1', 'second')]);
  });
});
