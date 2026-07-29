import React, { useEffect, useState } from 'react'
import SideBar from '../Sidebar'
import Table2 from '../../../Components/Table2'
import { Movies } from '../../../Data/MovieData'
import { HiPlusCircle } from 'react-icons/hi'
import { CategoriesData } from '../../../Data/CatagoriesData'
import CategoryModal from '../../../Components/Modals/CategoryModal'

const Categories = () => {
  const [modalOpen, setModalOpen] =useState(false);
  const [category, setCategory] =useState();
  const OnEditFunction = (id) =>{
    setCategory(id);
    setModalOpen(!modalOpen);
  };
  useEffect(()=>{
    if(modalOpen === false){
      setCategory();
    }
  }, [modalOpen]);
  return (
   <SideBar>
    <CategoryModal modalOpen={modalOpen} setModalOpen={setModalOpen} category={category}/>
    <div className='flex flex-col gap-6'>
        <div className='flex-btn gap-2'>
            <h2 className='text-xl font-bold'>Categories</h2>
            <button 
            onClick={()=>setModalOpen(true)}
            className='bg-subMain flex-rows gap-4 font-medium transitions hover:bg-main border border-subMain text-white py-2 px-4 rounded'>
              <HiPlusCircle /> Create  
            </button>
        </div>
        <Table2 data={CategoriesData} users={false} onEditFunction={OnEditFunction} />

    </div>
    </SideBar>

  )
}

export default Categories;