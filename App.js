// @flow
import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';

export default class App extends React.Component {
  state = {
    loading: false,
    data: [],
    page: 1,
    seed: 1,
    error: null,
    refreshing: false
  }

  // can wrap in a setTimeout to fake latency
  fetchData = () => {
    const { page, seed } = this.state;
    const url = `https://randomuser.me/api/?seed=${seed}&page=${page}&results=20`;

    this.setState({loading: true});

    fetch(url)
      .then(res => res.json())
      .then(r => {
        this.setState({
          data: page === 1 ? r.results : [...this.state.data, ...r.results], // return initial state or concat to it
          error: r.error || null,
          loading: false,
          refreshing: false
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({error, loading, refreshing: false});
      })
  }

  fetchMoreData = () => {
    this.setState({page: this.state.page + 1}, () => {
      console.log('hit the threshold!');
      this.fetchData()
    });
  }

  renderSeperator = () => {
    return (
      <View
        style={styles.ItemSeparatorStyle}
      />
    )
  }

  renderHeader = () => {
    return <SearchBar placeholder='Search' lightTheme round/>
  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View style={styles.FooterStyle}>
        <ActivityIndicator animating size='large'/>
      </View>
    )
  }

  handleRefresh = () => {
    this.setState({
      page: 1,
      refreshing: true,
      seed: this.state.seed + 1
    }, () => {
      this.fetchData();
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { ListStyle, ListItemStyle } = styles;

    return (
      <List containerStyle={ListStyle}>
        <FlatList
          data={this.state.data}
          keyExtractor={(item) => item.email}
          ItemSeparatorComponent={this.renderSeperator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
          onEndReached={this.fetchMoreData}
          onEndThreshold={100}
          renderItem={({ item }) => (
            <ListItem
              roundAvatar
              title={`${item.name.first} ${item.name.last}`}
              subtitle={item.email}
              avatar={{uri: item.picture.thumbnail}}
              containerStyle={ListItemStyle}
            />
          )}
        />
      </List>
    );
  }
}

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');
const styles = StyleSheet.create({
  listStyle: {
    borderTopWidth: 0,
    borderBottomWidth: 0
  },
  ListItemStyle: {
    borderBottomWidth: 0,
  },
  ItemSeparatorStyle: {
    height: 1,
    width: WIDTH - 100,
    backgroundColor: '#CED0CE',
    marginLeft: '14%',
    borderBottomWidth: 1,
    borderColor: 'dodgerblue'
  },
  FooterStyle: {
    paddingVertical: 20,
    borderTopWidth: 1,
    width: WIDTH - 100,
    marginLeft: '14%',
    borderTopColor: 'lightblue'
  }
});
