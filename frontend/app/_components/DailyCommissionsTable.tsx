import { AxiosHost } from "@/axiosGlobal";
import { DailyCommissions, Product } from "@/interfaces";
import { Page, LegacyCard, DataTable, Button } from "@shopify/polaris";
import React, { useEffect, useMemo, useState } from "react";

export default function DailyCommissionsTable({
  dailyCommissions,
  selectedResources,
  products,
  selectedStaff
}: {
  dailyCommissions: DailyCommissions[];
  selectedResources: string[];
  products: Product[];
  selectedStaff:string
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  console.log({ dailyCommissions, products });
  const computedRowsData = useMemo(() => {
    return dailyCommissions.map((dailyCommission) => {
      const ordersCount = dailyCommission.orders.length;
      const allProducts: Product[] = [];
      dailyCommission.orders.forEach((order) => {
        order.products.forEach((product) => {
          allProducts.push(product);
        });
      });
      const relatedProducts = products.filter((item: Product) =>
        allProducts.some((s: Product) => item.id === s.id)
      );
      const totalCommission = relatedProducts.reduce(
        (acc, product) => acc + product.commission,
        0
      );

      return [
        dailyCommission.day,
        ordersCount,
        `USD ${totalCommission.toFixed(2)}`,
      ];
    });
  }, [dailyCommissions, products]);
  const [saving, setSaving] = useState(false);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const handlePrevious = () => {
    if (offset > 1) {
      const newOffset = offset - 10;
      const newLimit = limit - 10;
      setOffset(newOffset);
      setLimit(newLimit);
    }
  };

  useEffect(() => {
    const displayedData = computedRowsData.slice(offset, limit);
    setDisplayedData(displayedData);
  }, [limit, offset, computedRowsData]);

  const handleNext = () => {
    // console.log({ offset, totalPages });
    if (limit < computedRowsData.length) {
      const newOffset = offset + 10;
      const newLimit = limit + 10;
      setOffset(newOffset);
      setLimit(newLimit);
    }
  };
  const handleSaveCommissionPlan = async () => {
    try {
      setSaving(true);
      const filtered: Product[] = products.filter(
        (item) => item.commission > 0
      );
      const commissionProducts = filtered.map((item) => ({
        percentage: Number(item.percentageValue),
        productId: item.id,
        orderId:item.orderId
      }));
      const { data } = await AxiosHost.post("saveCommissionPlan", {
        commissions: commissionProducts,
        staffMemberId:selectedStaff
       
      });
      console.log(data);
      alert("Commission plan saved successfully");
      setSaving(false);
    } catch (error) {
      setSaving(false);
    }
  };
  return (
    <Page title="Daily commissions">
      <LegacyCard>
        <DataTable
          columnContentTypes={["text", "numeric", "numeric"]}
          headings={["Day", "Total Orders", "Total commissions"]}
          rows={displayedData}
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
          //   totals={["", "", "", 255, "$155,830.00"]}
        />
      </LegacyCard>
      <Button loading={saving} onClick={handleSaveCommissionPlan}>
        Save Commission plan
      </Button>
    </Page>
  );
}
