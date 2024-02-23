"use client";
import { AxiosHost } from "@/axiosGlobal";
import { Product, StaffMember } from "@/interfaces";
import {
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
  useBreakpoints,
  Avatar,
  Link,
} from "@shopify/polaris";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import SimulationForm from "./_components/SimulationForm";
import { set } from "lodash";
const pageSize = 10;
export default function Home() {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState("");

  const handlePrevious = () => {
    if (offset > 1) {
      const newOffset = offset - 10;
      const newLimit = limit - 10;
      setOffset(newOffset);
      setLimit(newLimit);
    }
  };
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    const displayedData = products.slice(offset, limit);
    setDisplayedData(displayedData);
  }, [limit, offset]);

  const handleNext = () => {
    // console.log({ offset, totalPages });
    if (limit < products.length) {
      const newOffset = offset + 10;
      const newLimit = limit + 10;
      setOffset(newOffset);
      setLimit(newLimit);
    }
  };

  const [selected, setSelected] = useState(0);
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
  } = useIndexResourceState(products);

  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Category", value: "category asc", directionLabel: "Ascending" },
    { label: "Category", value: "category desc", directionLabel: "Descending" },
    { label: "Category", value: "category asc", directionLabel: "A-Z" },
    { label: "Category", value: "category desc", directionLabel: "Z-A" },
  ];
  const promotedBulkActions = [
    {
      content: "Apply to selected products",
      onAction: () => {
        const updated = [...products];
        updated.forEach((el) => {
          if (selectedResources.some((r) => r === el?.id)) {
            el.discountedPrice = el.price - (el.price * Number(discount)) / 100;
            el.percentageValue = discount;
            el.commission = (el.price * Number(discount)) / 100;
          }
        });
        setProducts(updated);
        clearSelection();
      },
    },
  ];
  const [sortSelected, setSortSelected] = useState(["category asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const [productCategory, setProductCategory] = useState<string[] | undefined>(
    undefined
  );
  const [queryValue, setQueryValue] = useState("");
  const handleProductCategoryChange = useCallback(
    (value: string[]) => {
      setProductCategory(value);
      const filtered =
        value.length > 0
          ? allProducts.filter((product) =>
              value.some((category) => product.category.includes(category))
            )
          : allProducts;
      setProducts(filtered);
      setDisplayedData(filtered.slice(offset, limit));
    },
    [products, displayedData]
  );

  const handleFiltersQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value);
      const filtered =
        value && value.length > 0
          ? allProducts.filter(
              (product) =>
                product.name.toLowerCase().includes(value.toLowerCase()) ||
                product.category.toLowerCase().includes(value.toLowerCase()) ||
                product.price.toString().includes(value.toLowerCase())
            )
          : allProducts;
      setProducts(filtered);
      setDisplayedData(filtered.slice(offset, limit));
    },
    [products, displayedData]
  );
  const handleProductCategoryRemove = useCallback(
    () => setProductCategory(undefined),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleProductCategoryRemove();
    handleQueryValueRemove();
    setProducts(allProducts)
  }, [handleProductCategoryRemove, handleQueryValueRemove,products]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await AxiosHost.get("/products");
      const all = data.products.map((item: Product) => ({
        ...item,
        discountedPrice: item.price,
        percentageValue: 0,
        commission: 0,
      }));

      const initialData = all.slice(offset, limit); // Define pageSize for items per page
      const totalPages = Math.ceil(all.length / pageSize);
      setTotalPages(totalPages);
      setDisplayedData(initialData);
      setProducts(all);
      setAllProducts(all);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const { data } = await AxiosHost.get("/staffMembers");
      setStaffMembers(data.staff);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStaffMembers();
  }, []);

  const resourceName = {
    singular: "product",
    plural: "products",
  };
  const filters = [
    {
      key: "category",
      label: "Product category",
      filter: (
        <ChoiceList
          title="Product category"
          titleHidden
          choices={Array.from(
            allProducts.reduce((categorySet, product) => {
              categorySet.add(product.category);
              return categorySet;
            }, new Set())
          ).map((category: any) => ({ label: category, value: category }))}
          selected={productCategory || []}
          onChange={handleProductCategoryChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];
  function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (productCategory && !isEmpty(productCategory)) {
    const key = "category";
    appliedFilters.push({
      key,
      label: productCategory.map((val) => `Category ${val}`).join(", "),
      onRemove: handleProductCategoryRemove,
    });
  }

  const rowMarkup = displayedData.map(
    (
      { id, name, price, imageUrl, category, percentageValue, discountedPrice },
      index
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Link dataPrimaryLink onClick={() => {}}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Avatar customer name={name} source={imageUrl} />
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {name}
              </Text>
            </div>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>{category}</IndexTable.Cell>
        <IndexTable.Cell>
          ${Number(discountedPrice).toFixed(2)} USD
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            label=""
            type="number"
            value={percentageValue}
            prefix="%"
            onChange={(value) => {
              const newProducts = [...products];
              newProducts[index].percentageValue = value;
              newProducts[index].discountedPrice =
                price - (price * Number(value)) / 100;
              newProducts[index].commission = (price * Number(value)) / 100;
              setProducts(newProducts);
            }}
            autoComplete="off"
          />
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <LegacyCard>
        {selectedResources.length > 0 && (
          <div style={{ margin: 10 }}>
            <TextField
              label="Discount"
              type="number"
              value={discount}
              prefix="%"
              onChange={(value) => {
                setDiscount(value);
              }}
              autoComplete="off"
            />
          </div>
        )}
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Searching in all"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => setQueryValue("")}
          onSort={setSortSelected}
          cancelAction={{
            onAction: onHandleCancel,
            disabled: false,
            loading: false,
          }}
          tabs={[]}
          selected={selected}
          onSelect={setSelected}
          canCreateNewView
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
          loading={loading}
        />
        <IndexTable
          condensed={useBreakpoints().smDown}
          resourceName={resourceName}
          itemCount={products.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Product" },
            { title: "Category" },
            { title: "Price" },
            { title: "Discount", alignment: "end" },
          ]}
          promotedBulkActions={promotedBulkActions}
          hasMoreItems
          pagination={{
            hasNext: true,
            hasPrevious: true,
            onNext: () => {
              handleNext();
            },
            onPrevious: () => {
              handlePrevious();
            },
          }}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>

      <div style={{ marginTop: 50 }}>
        <SimulationForm
          selectedResources={selectedResources}
          staffMembers={staffMembers}
          products={products}
        />
      </div>
    </div>
  );
}
