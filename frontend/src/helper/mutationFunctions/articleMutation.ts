// src/api/article/articleMutation.ts
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {Alert} from 'react-native';

// Constants for the API endpoints (you should define them somewhere globally)
import {
  UPDATE_VIEW_COUNT,
  SAVE_ARTICLE,
  LIKE_ARTICLE,
  UPDATE_READ_EVENT,
  POST_ARTICLE,
} from '../APIUtils';
import {ArticleData} from '../../type';

interface MutationOptions {
  user_token: string;
  item: ArticleData;
  success: () => void;
  error: () => void;
  navigation: any;
}

export const useUpdateViewCountMutation = ({
  user_token,
  item,
  success,
}: MutationOptions) => {
  return useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_VIEW_COUNT,
        {
          article_id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.article as ArticleData;
    },
    onSuccess: data => {
      //   navigation.navigate('ArticleScreen', {
      //  articleId: Number(item._id),
      //   authorId: item.authorId,
      //  });

      success();
    },
    onError: err => {
      Alert.alert('Internal server error, try again!');
    },
  });
};

export const useUpdateSaveStatusMutation = ({
  user_token,
  item,
  success,
}: MutationOptions) => {
  return useMutation({
    mutationKey: ['update-save-status'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        SAVE_ARTICLE,
        {
          article_id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data;
    },
    onSuccess: success,
    onError: () => {
      Alert.alert('Internal server error, try again!');
    },
  });
};

export const useUpdateLikeStatusMutation = ({
  user_token,
  item,
  success,
}: MutationOptions) => {
  return useMutation({
    mutationKey: ['update-like-status'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        LIKE_ARTICLE,
        {
          article_id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.article as ArticleData;
    },
    onSuccess: success,
    onError: () => {
      Alert.alert('Try Again!');
    },
  });
};

export const useUpdateReadEventMutation = ({
  user_token,
  item,
  success,
  error,
}: MutationOptions) => {
  return useMutation({
    mutationKey: ['update-read-event-status'],

    mutationFn: async () => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_READ_EVENT,
        {
          article_id: item?._id,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },

    onSuccess: () => {
      console.log('Read Event Updated');
      //    setReadEventSave(true);
      //Alert.alert('Your Read status updated'); For debug purpose
      // Snackbar.show({
      //  text: 'Your read status updated.',
      //   duration: Snackbar.LENGTH_SHORT,
      // });
      success();
    },

    onError: err => {
      console.log('Update Read Status mutation error', err);
      //Alert.alert('Try Again!');
      //console.log('Follow Error', err);
      // Snackbar.show({
      // text: 'Failed to update your read status.',
      // duration: Snackbar.LENGTH_SHORT,
      //  });
      error();
    },
  });
};

export const useCreatePostMutations = ({
  user_token,
  title,
  authorName,
  authorId,
  content,
  tags,
  imageUtils,
  success,
  error,
}: {
  user_token: string;
  title: string;
  authorName: string;
  authorId: string;
  content: string;
  tags: string[];
  imageUtils: string[];
  success: () => void;
  error: () => void;
}) => {
  return useMutation({
    mutationKey: ['create-post-key'],
    mutationFn: async () => {
      const response = await axios.post(
        POST_ARTICLE,
        {
          title: title,
          authorName: authorName,
          authorId: authorId,
          content: content,
          tags: tags,
          imageUtils: imageUtils,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      // console.log(article);
      return response.data as any;
    },

    onSuccess: () => {
      //Alert.alert('Article added sucessfully');
      //navigation.navigate('TabNavigation');
      success();
    },
    onError: er => {
      console.log('Article post Error', er);
      // console.log(error);

      //Alert.alert('Failed to upload your post');
      error();
    },
  });
};


