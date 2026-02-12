import { Linking } from "react-native";


let pendingRoute: any = null;
export const initDeepLinking =  (navigation: any, isAuthenticated: boolean) => {

  

  const handleUrl = (url: string) => {
   
    const parsed = new URL(url);

    if (parsed.pathname.startsWith('/api/share/article')) {
      pendingRoute = {
        name: 'ArticleScreen',
        params: {
          articleId: Number(parsed.searchParams.get("articleId")),
          authorId: parsed.searchParams.get('authorId'),
          recordId: parsed.searchParams.get('recordId'),
        },
      };
    }

    if (parsed.pathname.startsWith('/api/share/podcast')) {
      pendingRoute = {
        name: 'PodcastDetail',
        params: {
          trackId: parsed.searchParams.get('trackId'),
          audioUrl: parsed.searchParams.get('audioUrl'),
        },
      };
    }
  

    resolveNavigation(navigation, isAuthenticated);
  };

  Linking.getInitialURL().then(url => {
    if (url) handleUrl(url);
  });

  Linking.addEventListener('url', e => handleUrl(e.url));
};

const resolveNavigation = (navigation: any, isAuthenticated: boolean) => {
  if (!pendingRoute) return;

  if (!isAuthenticated) {
    navigation.navigate('LoginScreen', {
      redirectTo: pendingRoute,
    });
  } else {
    navigation.navigate(pendingRoute.name, pendingRoute.params);
    pendingRoute = null;
  }
};
