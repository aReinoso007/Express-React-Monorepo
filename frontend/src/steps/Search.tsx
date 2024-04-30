import { useEffect, useState } from "react";
import { Data } from "../types";
import { useDebounce } from "@uidotdev/usehooks";
import { searchData } from "../services/search";

const DEBOUNCE_TIME = 500;

export const Search = ({ initialData }: { initialData: Data }) => {
  const [data, setData] = useState<Data>(initialData);
  const [search, setSearch] = useState<string>(()=>{
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') ?? '';
  });
  const debounceSearch = useDebounce(search, DEBOUNCE_TIME);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    const search = event.target.value;
    const filteredData = initialData.filter((item) => {
      return Object.values(item).some((value) => value.includes(search));
    });
    setData(filteredData);
  };

  useEffect(() =>{
    const newPathName = debounceSearch === '' ? window.location.pathname : `?q=${debounceSearch}`;
    window.history.pushState({}, '', newPathName);
  }, [debounceSearch]);

  useEffect(() => {
    if(!debounceSearch){
        setData(initialData);
        return;
    }
    searchData(debounceSearch)
        .then(res =>{
            const [err, newData] = res;
            if(err){
                console.error(err);
                return;
            }
            if(newData){
                setData(newData);
                console.log('search data', newData);
            }
        })
  },[debounceSearch, initialData]);

  return (
    <div>
      <h1>Search</h1>
      <form>
        <input onChange={handleSearch} type="search" placeholder="Search..." defaultValue={search}/>
      </form>
      {
        data.map((row) => (
          <ul key={row.id}>
            <li key={row.id}>
                <article>
                    {Object
                        .entries(row)
                        .map(([key, value]) => <p key={key}><strong>{key}:</strong>{value}</p>)
                    }
                </article>
            </li>
          </ul>
        ))
      }
    </div>
  );
};
