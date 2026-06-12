import * as ExpoLinking from 'expo-linking';

import {RootStackParamList} from '../type';

type DeepLinkTarget = {
  name: keyof RootStackParamList;
  params?: Record<string, any>;
  requiresAuth?: boolean;
};

const prefixes = [
  ExpoLinking.createURL('/'),
  'ultimatehealth://',
  'https://uhsocial.in',
];

let initialUrlHandled = false;


const restrictedRoutes = new Set([
  'EditorScreen',
  'PodcastForm',
  'ProfileEditScreen',
  'NotificationPreferencesScreen',
  'NotificationScreen',
  'LogoutScreen',
  'ReviewScreen',
  'ImprovementReviewScreen',
]);

const parseNumericParam = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const getPathSegments = (path?: string | null) => {
  return (path || '').replace(/^\/+/, '').split('/').filter(Boolean);
};

const resolveDeepLinkTarget = (url: string): DeepLinkTarget | null => {
  const parsed = ExpoLinking.parse(url);
  const segments = getPathSegments(parsed.path);
  const [firstSegment, secondSegment] = segments;
  const queryParams = parsed.queryParams ?? {};

  if (firstSegment === 'api' && secondSegment === 'share') {
    const shareType = segments[2];

    if (shareType === 'article') {
      const articleId = parseNumericParam(queryParams.articleId);

      if (articleId === undefined) {
        return null;
      }

      return {
        name: 'ArticleScreen',
        params: {
          articleId,
          authorId: queryParams.authorId,
          recordId: queryParams.recordId,
        },
      };
    }

    if (shareType === 'podcast') {
      const trackId =
        typeof queryParams.trackId === 'string'
          ? queryParams.trackId
          : undefined;

      if (!trackId) {
        return null;
      }

      return {
        name: 'PodcastDetail',
        params: {
          trackId,
        },
      };
    }
  }

  if (firstSegment === 'article') {
    const articleId = parseNumericParam(secondSegment ?? queryParams.articleId);

    if (articleId === undefined) {
      return null;
    }

    return {
      name: 'ArticleScreen',
      params: {
        articleId,
        authorId: queryParams.authorId,
        recordId: queryParams.recordId,
      },
    };
  }

  if (firstSegment === 'podcast') {
    const trackId = secondSegment ?? queryParams.trackId;

    if (typeof trackId !== 'string' || !trackId) {
      return null;
    }

    return {
      name: 'PodcastDetail',
      params: {
        trackId,
      },
    };
  }

  if (firstSegment === 'profile') {
    const authorId = secondSegment ?? queryParams.authorId;

    if (typeof authorId !== 'string' || !authorId) {
      return null;
    }

    return {
      name: 'UserProfileScreen',
      params: {
        authorId,
        author_handle: queryParams.author_handle,
        userHandle: queryParams.user_handle,
        userId: queryParams.userId,
      },
    };
  }

  if (firstSegment === 'create-post') {
    return {
      name: 'ArticleDescriptionScreen',
      params: {
        article: undefined,
        htmlContent: undefined,
        translationSource: undefined,
      },
      requiresAuth: true,
    };
  }

  if (firstSegment === 'create-podcast') {
    return {
      name: 'PodcastForm',
      requiresAuth: true,
    };
  }

  if (firstSegment === 'settings' && secondSegment === 'profile') {
    return {
      name: 'ProfileEditScreen',
      requiresAuth: true,
    };
  }

  if (firstSegment === 'settings' && secondSegment === 'notifications') {
    return {
      name: 'NotificationPreferencesScreen',
      requiresAuth: true,
    };
  }

  return null;
};

export const initDeepLinking = (navigation: any, isAuthenticated: boolean) => {
  const handleUrl = (url: string) => {
    const target = resolveDeepLinkTarget(url);

    if (!target) {
      return;
    }

    if (target.requiresAuth && !isAuthenticated) {
      // This path is for routes that explicitly require authentication and should
      // redirect to the LoginScreen, preserving the intended destination.
      navigation.navigate('LoginScreen', {
        redirectTo: {
          name: target.name,
          params: target.params,
        },
      });
      return;
    }

    if (restrictedRoutes.has(target.name) && !isAuthenticated) {
      // This path is for routes that are generally restricted for guests but
      // may not have a specific 'redirectTo' login flow, instead showing a placeholder.
      // Note: Routes with 'requiresAuth: true' will be handled by the above block first.
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in to continue to this part of the app.',
        iconName: 'user-lock',
      });
      return;
    }

    navigation.navigate(target.name as never, target.params as never);
  };

  if (!initialUrlHandled) {
    initialUrlHandled = true;
    ExpoLinking.getInitialURL().then(url => {
      if (url) {
        handleUrl(url);
      }
    });
  }

  const subscription = ExpoLinking.addEventListener('url', e => {
    handleUrl(e.url);
  });

  return () => subscription.remove();
};

export {resolveDeepLinkTarget};
