  <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        onScroll={e => {
          var windowHeight = Dimensions.get('window').height,
            height = e.nativeEvent.contentSize.height,
            offset = e.nativeEvent.contentOffset.y;
          if (windowHeight + offset >= height) {
            //ScrollEnd,
            console.log('ScrollEnd');
            if (article && !readEventSave) {
              updateReadEventMutation.mutate();
            }
          }
        }}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          {article && article?.imageUtils && article?.imageUtils.length > 0 ? (
            <Image
              source={{uri: article?.imageUtils[0]}}
              style={styles.image}
            />
          ) : (
            <Image
              source={require('../../assets/article_default.jpg')}
              style={styles.image}
            />
          )}
          {updateLikeMutation.isPending ? (
            <ActivityIndicator size={40} color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              onPress={handleLike}
              style={[
                styles.likeButton,
                {
                  backgroundColor: 'white',
                },
              ]}>
              <FontAwesome
                name="heart"
                size={34}
                color={
                  article &&
                  article?.likedUsers &&
                  article?.likedUsers?.some(user => user._id === user_id)
                    ? PRIMARY_COLOR
                    : 'black'
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.contentContainer}>
          {article && (
            <Text style={{...styles.viewText, marginBottom: 10}}>
              {article && article?.viewUsers.length
                ? article.viewUsers.length > 1
                  ? `${formatCount(article.viewUsers.length)} views`
                  : `${article.viewUsers.length} view`
                : '0 view'}
            </Text>
          )}
          {article && article?.tags && (
            <Text style={styles.categoryText}>
              {article.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}

          {article && (
            <>
              <Text style={styles.titleText}>{article?.title}</Text>
              <View style={styles.avatarsContainer}>
                <View style={styles.avatar}>
                  {/** 3rd image will be display here */}
                  {article?.likedUsers && article?.likedUsers.length >= 3 ? (
                    <Image
                      source={{
                        uri: article?.likedUsers[2].Profile_image.startsWith(
                          'https',
                        )
                          ? article?.likedUsers[2].Profile_image
                          : `${GET_STORAGE_DATA}/${article?.likedUsers[2].Profile_image}`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[2].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  ) : (
                    <>
                      {article?.likedUsers &&
                        article?.likedUsers.length >= 1 && (
                          <Image
                            source={{
                              uri: article?.likedUsers[0].Profile_image.startsWith(
                                'https',
                              )
                                ? article?.likedUsers[0].Profile_image
                                : `${GET_STORAGE_DATA}/${article?.likedUsers[0].Profile_image}`,
                            }}
                            style={[
                              styles.profileImage,
                              !article?.likedUsers[0].Profile_image && {
                                borderWidth: 0.5,
                                borderColor: 'black',
                              },
                            ]}
                          />
                        )}
                    </>
                  )}
                </View>
                <View style={[styles.avatar, styles.avatarOverlap]}>
                  {/** 2nd image will be display here */}

                  {article?.likedUsers && article?.likedUsers.length >= 2 ? (
                    <Image
                      source={{
                        uri: article?.likedUsers[1].Profile_image.startsWith(
                          'https',
                        )
                          ? article?.likedUsers[1].Profile_image
                          : `${GET_STORAGE_DATA}/${article?.likedUsers[1].Profile_image}`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[1].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  ) : (
                    <>
                      {article?.likedUsers &&
                        article?.likedUsers.length >= 1 && (
                          <Image
                            source={{
                              uri: article?.likedUsers[0].Profile_image.startsWith(
                                'https',
                              )
                                ? article?.likedUsers[0].Profile_image
                                : `${GET_STORAGE_DATA}/${article?.likedUsers[0].Profile_image}`,
                            }}
                            style={[
                              styles.profileImage,
                              !article?.likedUsers[0].Profile_image && {
                                borderWidth: 0.5,
                                borderColor: 'black',
                              },
                            ]}
                          />
                        )}
                    </>
                  )}
                </View>
                <View style={[styles.avatar, styles.avatarDoubleOverlap]}>
                  {/** 1st Image  will be display here */}
                  {article?.likedUsers && article?.likedUsers.length >= 1 && (
                    <Image
                      source={{
                        uri: article?.likedUsers[0].Profile_image.startsWith(
                          'https',
                        )
                          ? article?.likedUsers[0].Profile_image
                          : `${GET_STORAGE_DATA}/${article?.likedUsers[0].Profile_image}`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[0].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={[styles.avatar, styles.avatarTripleOverlap]}>
                  <Text style={styles.moreText}>
                    +
                    {article?.likedUsers
                      ? formatCount(article.likedUsers.length)
                      : 0}
                  </Text>
                </View>
              </View>
            </>
          )}
          <View style={styles.descriptionContainer}>
            <WebView
              style={{
                padding: 7,
                //width: '99%',
                minHeight: webviewHeight,
                // flex:7,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={webViewRef}
              originWhitelist={['*']}
              injectedJavaScript={cssCode}
              source={contentSource}
              textZoom={100}
            />
          </View>
        </View>

        <View style={{padding: wp(4), marginTop: hp(4.5)}}>
          {comments?.map((item, index) => (
            <CommentItem
              key={index}
              item={item}
              isSelected={selectedCommentId === item._id}
              userId={user_id}
              setSelectedCommentId={setSelectedCommentId}
              handleEditAction={handleEditAction}
              deleteAction={handleDeleteAction}
              handleLikeAction={handleLikeAction}
              commentLikeLoading={commentLikeLoading}
              handleMentionClick={handleMentionClick}
              handleReportAction={handleReportAction}
              isFromArticle={true}
            />
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom : insets.bottom + 20,
          },
        ]}>
        <View style={styles.authorContainer}>
          <TouchableOpacity
            onPress={() => {
              //  if (article && article?.authorId) {
              navigation.navigate('UserProfileScreen', {
                authorId: authorId,
              });
            }}>
            {profile_image && profile_image !== '' ? (
              <Image
                source={{
                  uri: profile_image.startsWith('http')
                    ? `${profile_image}`
                    : `${GET_STORAGE_DATA}/${profile_image}`,
                }}
                style={styles.authorImage}
              />
            ) : (
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                }}
                style={styles.authorImage}
              />
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.authorName}>
              {article ? article?.authorName : ''}
            </Text>
            <Text style={styles.authorFollowers}>
              {authorFollowers
                ? authorFollowers.length > 1
                  ? `${authorFollowers.length} followers`
                  : `${authorFollowers.length} follower`
                : '0 follower'}
            </Text>
          </View>
        </View>
        {article &&
          user_id !== article.authorId &&
          (updateFollowMutation.isPending ? (
            <ActivityIndicator size={40} color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}>
              <Text style={styles.followButtonText}>
                {authorFollowers && authorFollowers.includes(user_id)
                  ? 'Following'
                  : 'Follow'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>