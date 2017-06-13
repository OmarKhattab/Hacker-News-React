import React, { Component, PropTypes } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;
console.log(url);

const isSearched = (searchTerm) => (item) =>
 !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list , 'points').reverse(),
};


class App extends Component {

constructor(props) {
  super(props);
  this.state = {
    results: null,
    searchKey: '',
    searchTerm: DEFAULT_QUERY,
    isLoading: false,
    sortKey: 'NONE',
    isSortReverse: false,
  }
  this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  this.setSearchTopStories = this.setSearchTopStories.bind(this);
  this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  this.onDismiss = this.onDismiss.bind(this);
  this.onSearchChange = this.onSearchChange.bind(this);
  this.onSearchSubmit = this.onSearchSubmit.bind(this);
  this.onSort = this.onSort.bind(this);
}

onSort(sortKey) {
  const isSortReverse = this.state.SortKey === sortKey && !this.state.isSortReverse;
  this.setState({ sortKey, isSortReverse });
}

needsToSearchTopStories(searchTerm) {
  return !this.state.results[searchTerm];
}

onSearchSubmit(event) {
  const { searchTerm } = this.state;
  this.setState({ searchKey: searchTerm });

  if(this.needsToSearchTopStories(searchTerm)) {
    this.fetchSearchTopStories(searchTerm, DEFAULT_PAGE);
  }

  event.preventDefault();
}

setSearchTopStories(result) {
  const { hits, page } = result;
  const { searchKey, results } = this.state;

  const oldHits = results && results[searchKey]
    ? results[searchKey].hits
    : [];

  const updatedHits = [
    ...oldHits,
    ...hits
];
  this.setState({
    results: {
    ...results,
    [searchKey]: { hits: updatedHits, page }
},
  isLoading: false
  });
}

 fetchSearchTopStories(searchTerm, page) {
   this.setState({ isLoading: true });

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}
      &${PARAM_PAGE}\
${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result));
  }

componentDidMount() {
  const { searchTerm } = this.state;
  this.setState({ searchKey: searchTerm });
  this.fetchSearchTopStories(searchTerm, DEFAULT_PAGE);
}

onDismiss(id) {
  const { searchKey, results } = this.state;
  const { hits, page } = results[searchKey];

  const isNotId = item => item.objectID !== id;
  const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
}

onSearchChange(event) {
    this.setState({ searchTerm: event.target.value});
}

render() {
    const {
      searchTerm,
      results,
      searchKey,
      isLoading,
      sortKey,
      isSortReverse
    } = this.state;
    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table
            isSortReverse={isSortReverse}
            list={list}
            sortKey={sortKey}
            onSort={this.onSort}
            onDismiss={this.onDismiss}
          />
          <div className="interactions">
            <ButtonWithLoading
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1 )}>
              More
            </ButtonWithLoading>
          </div>
       </div>
      );
    }
}

const Search =
({ value,
  onChange,
  onSubmit,
  children
 }) =>
      <form onSubmit={onSubmit}>
       <input
        type="text"
        value={value}
        onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
    </form>


const Table = ({ list,
                onDismiss,
                sortKey,
                onSort,
                isSortReverse
              }) => {
        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = isSortReverse
        ? sortedList.reverse()
        : sortedList;
        return(
      <div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort
              sortKey={'TITLE'}
              onSort={onSort}
              activeSortKey={sortKey}
            >
              Title
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={onSort}
              activeSortKey={sortKey}
            >
              Author
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={onSort}
              activeSortKey={sortKey}
            >
              Comments
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'POINTS'}
              onSort={onSort}
              activeSortKey={sortKey}
            >
              Points
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
        </div>
        { reverseSortedList.map(item =>
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>
              {item.author}
            </span>
            <span style={{ width: '10%' }}>
              {item.num_comments}
            </span>
            <span style={{ width: '10%' }}>
              {item.points}
            </span>
            <span style={{ width: '10%' }}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="button-inline"
              >
                Dismiss
              </Button>
            </span>
          </div>
        )}
      </div>
    );
  }
const Button = ({ onClick, className, children }) =>
        <button
          onClick={onClick}
          className={className}
          type="button"
            >
            {children}
       </button>

 const Loading = () => <div>Loading ...</div>

 const withLoading = (Component) => ({ isLoading, ...rest }) =>
     isLoading ? <Loading /> : <Component { ...rest } />

 const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
    const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
);
return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
>
  {children}
  </Button> );
}

Button.defaultProps = {
    className: '',
};
Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

Table.propTypes = {

export default App;

export {
  Button,
  Search,
  Table,
};