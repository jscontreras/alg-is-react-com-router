import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import { InstantSearch, useRange, Configure, Hits, SearchBox, useNumericMenu, DynamicWidgets, RefinementList, HierarchicalMenu, useRefinementList, Pagination, ToggleRefinement } from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch';
import './styles.css'
import { history } from 'instantsearch.js/es/lib/routers';


const routerProxy = {
  router: history({
    createURL({ qsModule, location, routeState }) {
      const { origin, pathname, hash } = location;
      const indexKeys = Object.keys(routeState);
      if (indexKeys.length > 0) {
        const indexKey = indexKeys[0];
        const query = routeState[indexKey].query ? routeState[indexKey].query : null;
        delete routeState[indexKey].query;
        // create new state with compressed version
        const compressedUrl = {
          i1: {
            ...routeState[indexKey]
          }
        }
        const queryString = qsModule.stringify(compressedUrl);
        if (query) {
          return `${origin}${pathname}?term=${query}&searchTerm=${query}&searchType=default&index=${indexKey}${queryString.length > 0 ? '&' : ''}${queryString}${hash}`;

        } else {
          return `${origin}${pathname}?searchType=default&index=${indexKey}${queryString.length > 0 ? '&' : ''}${queryString}${hash}`;
        }
      } else {
        return `${origin}${pathname}${hash}`;
      }
    },
    parseURL({ qsModule, location }) {
      const parsed = qsModule.parse(location.search.slice(1));
      let query = null;
      // capture term if available
      if (parsed.term && parsed.index) {
        query = parsed.term;
        if (query) {
          if (!parsed['i1']) {
            parsed['i1'] = {};
          }
          parsed['i1']['query'] = query;
        }
      }
      // remove search Type and queries
      delete parsed.term;
      delete parsed.searchTerm;
      delete parsed.searchType;

      // Check if can decompress
      if (parsed.index) {
        const finalObj = {};
        finalObj[parsed.index] = {...parsed.i1};
        delete parsed.index;
        console.log('finalObj', finalObj)
        return finalObj;
      }
      return parsed
    },
  })
};

const appId = 'SGF0RZXAXL';
const apiKey = '92a97e0f8732e61569c6aa4c2b383308';

const searchClient = algoliasearch(appId, apiKey);


/**
 * Extract Numeric Items based on Range.
 * @param {} param0
 * @returns
 */
function geOptionsFromRange({ min, max }) {
  if (min == 0 && max == 0) {
    return [{ label: 'All' }];
  }
  else {
    const range = max - min;
    const segmentSize = range / 5;
    const segments = [];

    for (let i = 0; i < 5; i++) {
      const segmentMin = parseInt(min + i * segmentSize);
      const segmentMax = parseInt(segmentMin + segmentSize);
      segments.push({ label: `Between ${segmentMin} - ${segmentMax}`, start: segmentMin, end: segmentMax });
    }

    return segments;
  }
}

/**
 * Numeric Menu
 * @param {} props
 * @returns
 */
export function NumericMenu(props) {
  const { range } = useRange({ attribute: props.attribute });

  const numericItems = geOptionsFromRange(range);
  const { items, refine } = useNumericMenu({
    ...props,
    items: numericItems,
  });


  if (range.max !== 0 && range.min !== 0) {
    return (
      <div
      >
        <ul className="ais-NumericMenu-list">
          {items.map((item) => (
            <li
              key={item.value}

            >
              <label className="ais-NumericMenu-label">
                <input
                  className="ais-NumericMenu-radio"
                  type="radio"
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                />
                <span className="ais-NumericMenu-labelText">{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <></>;

}

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/search">
          <InstantSearch searchClient={searchClient} indexName="prod_ECOM" routing={routerProxy}>
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
                  <RefinementWrapper attribute='price.value' widget={NumericMenu} />
                  <RefinementWrapper attribute="price.on_sales" widget={ToggleRefinement} />
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
  const Component = props.widget || RefinementList;
  const elemProps = { ...props, widget: null };
  const {
    items,
  } = useRefinementList(props);
  return <div className="facet">
    {items.length > 0 && <span className="facet-name">{props.attribute}</span>}
    <Component {...elemProps} />
  </div>
}

const HierarchicalMenuWrapper = (props) => {
  return <div className="facet">
    <span className="facet-name">{props.title}</span>
    <HierarchicalMenu {...props} />
  </div>
}

export default App;