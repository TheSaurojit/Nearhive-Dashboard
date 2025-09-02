"use client"

import React, { useState, useMemo } from "react"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  useFeaturedStoresQuery,
  useStoresQuery,
} from "@/hooks/useFiresStoreQueries"
import { Store, FeaturedStores } from "@/types/backend/models"
import {
  addToFeaturedStores,
  removeFromFeaturedStores,
} from "@/services/featuredStores"
import EditLogosDialog from "./EditLogosDialog"

const ITEMS_PER_PAGE = 10

function StoreTable() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editStoreId, setEditStoreId] = useState<string | null>(null)

  const { data: storesData = [], isLoading } = useStoresQuery()
  const { data: FeaturedData, refetch: refetchFeatured } =
    useFeaturedStoresQuery() as { data?: FeaturedStores; refetch: () => void }

  const featuredIds = useMemo(
    () => new Set(FeaturedData?.stores ?? []),
    [FeaturedData]
  )

  const filtered = useMemo(
    () =>
      storesData.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [storesData, search]
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleToggleFeatured = async (storeId: string, isNowFeatured: boolean) => {
    try {
      if (isNowFeatured) await addToFeaturedStores(storeId)
      else await removeFromFeaturedStores(storeId)
      refetchFeatured()
    } catch (err) {
      alert("Error updating featured status")
    }
  }

  return (
    <div className="w-full px-4 py-6">
      {/* Search */}
      <div className="flex items-center justify-between pb-4">
        <Input
          placeholder="Search store..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Banner</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length ? (
              paginatedData.map((store) => {
                const isFeatured = featuredIds.has(store.storeId)
                return (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.storeId}</TableCell>
                    <TableCell>
                      {store.logoUrl ? (
                        <img src={store.logoUrl} className="w-10 h-10 rounded object-cover" />
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {store.bannerUrl ? (
                        <img src={store.bannerUrl} className="w-16 h-10 rounded object-cover" />
                      ) : "-"}
                    </TableCell>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.category}</TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.location}</TableCell>
                    <TableCell>
                      {store.isBlocked
                        ? "Blocked"
                        : store.isPaused
                        ? "Paused"
                        : store.isActive
                        ? "Active"
                        : "Inactive"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isFeatured}
                        onCheckedChange={(c) => handleToggleFeatured(store.storeId, c)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setEditStoreId(store.storeId)}>
                        Edit Logos
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                  No stores found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Logos Dialog */}
      <EditLogosDialog storeId={editStoreId} onClose={() => setEditStoreId(null)} />
    </div>
  )
}

export default StoreTable
