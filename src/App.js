import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import { InstantSearch, RangeInput, Configure, Hits, SearchBox, DynamicWidgets, RefinementList, HierarchicalMenu, useRefinementList, Pagination, ToggleRefinement } from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch';
import './styles.css'

const appId = 'SGF0RZXAXL';
const apiKey = '92a97e0f8732e61569c6aa4c2b383308';
const searchClient = algoliasearch(appId, apiKey);

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/search">
          <InstantSearch searchClient={searchClient} indexName="prod_ECOM" routing={true}>
            <Configure />
            <div className='header'>
              <h1>My InstantSearch App (React-Router-DOM)</h1>
              <SearchBox />
            </div>
            <div className="search-results">
              <div className='left-column'>
                <DynamicWidgets
                  fallbackComponent={RefinementWrapper}
                >
                  <HierarchicalMenuWrapper
                    attributes={['hierarchical_categories.lvl0', 'hierarchical_categories.lvl1', 'hierarchical_categories.lvl2']}
                    title="Product Catalog"
                  />
                  <RefinementWrapper attribute="brand" />
                  <RefinementWrapper attribute='price.value' Component={RangeInput}/>
                  <RefinementWrapper attribute="price.on_sales" Component={ToggleRefinement} />
                </DynamicWidgets>
              </div>
              <div className="center-collumn">
                <Pagination />
                <Hits />
                <Pagination />
              </div>
            </div>

          </InstantSearch>
        </Route>
        <Route path="/">
          <div>
            <h1>Welcome to My App</h1>
            <p>Go to the <Link to="/search">search page</Link> to use InstantSearch.</p>
          </div>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

const RefinementWrapper = (props) => {
  const Component = props.Component || RefinementList
  const {
    items,
  } = useRefinementList(props);
  return <div className="facet">
    {items.length > 0 && <span className="facet-name">{props.attribute}</span>}
    <Component {...props} />
  </div>
}

const HierarchicalMenuWrapper = (props) => {
  return <div className="facet">
    <span className="facet-name">{props.title}</span>
    <HierarchicalMenu {...props} />
  </div>
}

export default App;