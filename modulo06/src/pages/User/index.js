import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  ItemButton,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  // eslint-disable-next-line react/state-in-constructor
  state = {
    stars: [],
    loading: false,
    refreshing: false,
    page: 1,
    lastPage: false,
  };

  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  async componentDidMount() {
    Icon.loadFont();

    this.setState({
      loading: true,
      page: 1,
      lastPage: false,
    });

    this.getStarred();
  }

  handleNavigation = repository => {
    const { navigation } = this.props;
    navigation.navigate('WebView', { repository });
  };

  getStarred = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      loading: false,
      refreshing: false,
    });
  };

  loadMore = async () => {
    const { lastPage } = this.state;
    if (!lastPage) {
      const { navigation } = this.props;
      const user = navigation.getParam('user');
      const { stars } = this.state;

      let { page } = this.state;

      page += 1;

      const response = await api.get(
        `/users/${user.login}/starred?page=${page}`
      );
      const { data } = response;
      if (data.length === 0) {
        await this.setState({
          lastPage: true,
        });
      } else {
        await this.setState({
          stars: [...stars, ...response.data],
          page,
        });
      }
    }
  };

  refreshList = async () => {
    this.setState({
      refreshing: true,
      page: 1,
    });

    this.getStarred();
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 25 }} color="#7159c1" />
        ) : (
          <Stars
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
                <ItemButton onPress={() => this.handleNavigation(item)}>
                  <Icon name="keyboard-arrow-right" size={30} color="#fff" />
                </ItemButton>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
