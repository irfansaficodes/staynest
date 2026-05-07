import { useState } from "react";
import { useQuery, useMutation } from "react-query";
import * as apiClient from "../api-client";
import type { RoomFormData } from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Plus, Edit2, Trash2, Bed, Users, DollarSign } from "lucide-react";

interface Room {
  _id: string;
  hotelId: string;
  name: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  maxOccupancy: number;
  size?: number;
  bedType: string;
  amenities: string[];
  imageUrls: string[];
  isActive: boolean;
}

const RoomManagement = ({ hotelId }: { hotelId: string }) => {
  const { showToast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerNight: "",
    totalRooms: "",
    availableRooms: "",
    maxOccupancy: "",
    bedType: "",
    amenities: "",
  });

  const { data, refetch } = useQuery(
    ["fetchRooms", hotelId],
    () => apiClient.fetchRooms(hotelId),
    { enabled: !!hotelId }
  );

  const rooms: Room[] = data?.rooms || [];

  const createMutation = useMutation(
    (roomData: RoomFormData) => apiClient.createRoom(hotelId, roomData),
    {
      onSuccess: () => {
        showToast({ title: "Room Created", type: "SUCCESS" });
        refetch();
        setIsOpen(false);
        resetForm();
      },
      onError: () => showToast({ title: "Error", description: "Could not create room", type: "ERROR" }),
    }
  );

  const updateMutation = useMutation(
    (vars: { roomId: string; data: Partial<RoomFormData> }) => apiClient.updateRoom(vars.roomId, vars.data),
    {
      onSuccess: () => {
        showToast({ title: "Room Updated", type: "SUCCESS" });
        refetch();
        setIsOpen(false);
        resetForm();
      },
      onError: () => showToast({ title: "Error", description: "Could not update room", type: "ERROR" }),
    }
  );

  const deleteMutation = useMutation(apiClient.deleteRoom, {
    onSuccess: () => {
      showToast({ title: "Room Deleted", type: "SUCCESS" });
      refetch();
    },
    onError: () => showToast({ title: "Error", description: "Could not delete room", type: "ERROR" }),
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", pricePerNight: "", totalRooms: "", availableRooms: "", maxOccupancy: "", bedType: "", amenities: "" });
    setEditingRoom(null);
  };

  const handleOpen = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        description: room.description,
        pricePerNight: String(room.pricePerNight),
        totalRooms: String(room.totalRooms),
        availableRooms: String(room.availableRooms),
        maxOccupancy: String(room.maxOccupancy),
        bedType: room.bedType,
        amenities: room.amenities.join(", "),
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      totalRooms: Number(formData.totalRooms),
      availableRooms: Number(formData.availableRooms),
      maxOccupancy: Number(formData.maxOccupancy),
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
    };

    if (editingRoom) {
      updateMutation.mutate({ roomId: editingRoom._id, data: roomData });
    } else {
      createMutation.mutate(roomData);
    }
  };

  const totalRooms = rooms.reduce((sum, r) => sum + r.totalRooms, 0);
  const totalAvailable = rooms.reduce((sum, r) => sum + r.availableRooms, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Room Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalRooms} total rooms | {totalAvailable} available
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
              <DialogDescription>Fill in the room details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Bed Type</Label>
                  <Input value={formData.bedType} onChange={(e) => setFormData({ ...formData, bedType: e.target.value })} placeholder="e.g. King, Twin" required />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price/Night</Label>
                  <Input type="number" value={formData.pricePerNight} onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })} required />
                </div>
                <div>
                  <Label>Total Rooms</Label>
                  <Input type="number" value={formData.totalRooms} onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })} required />
                </div>
                <div>
                  <Label>Available</Label>
                  <Input type="number" value={formData.availableRooms} onChange={(e) => setFormData({ ...formData, availableRooms: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Occupancy</Label>
                  <Input type="number" value={formData.maxOccupancy} onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })} required />
                </div>
                <div>
                  <Label>Amenities (comma separated)</Label>
                  <Input value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="TV, Mini Bar, AC" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingRoom ? "Update Room" : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border">
          <Bed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No rooms added yet. Click "Add Room" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{room.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{room.bedType}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpen(room)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(room._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{room.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">₹{room.pricePerNight}/night</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-blue-600" />
                  <span>{room.availableRooms}/{room.totalRooms} available</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Max {room.maxOccupancy}</span>
                </div>
              </div>
              {room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t">
                  {room.amenities.map((a, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
