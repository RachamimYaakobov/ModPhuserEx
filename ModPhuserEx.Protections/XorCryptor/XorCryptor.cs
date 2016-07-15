using Confuser.Core;
using Confuser.Core.Helpers;
using Confuser.Core.Services;
using dnlib.DotNet;
using dnlib.DotNet.Emit;
using dnlib.DotNet.MD;
using dnlib.DotNet.Writer;
using dnlib.PE;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using FileAttributes = dnlib.DotNet.FileAttributes;
using SR = System.Reflection;

namespace Confuser.Protections
{
    internal class XorCryptor : Packer
    {
        public const string _Id = "xorcryptor";
        public const string _FullId = "0xFireball.XorCryptor";
        public const string _ServiceId = "0xFireball.XorCryptor";
        public static readonly object ContextKey = new object();

        public override string Name
        {
            get { return "XorCryptor Packer"; }
        }

        public override string Description
        {
            get { return "This packer encrypts the output with a simple XOR cipher."; }
        }

        public override string Id
        {
            get { return _Id; }
        }

        public override string FullId
        {
            get { return _FullId; }
        }

        protected override void Initialize(ConfuserContext context)
        {
        }

        protected override void PopulatePipeline(ProtectionPipeline pipeline)
        {
            //TODO: Add something here
        }

        protected override void Pack(ConfuserContext context, ProtectionParameters parameters)
        {
            //TODO: Implement packing
            context.Logger.Debug("XorCryptor has not yet been implemented.");
            context.Logger.EndProgress();
        }

        private static string GetId(byte[] module)
        {
            var md = MetaDataCreator.CreateMetaData(new PEImage(module));
            var assemblyRow = md.TablesStream.ReadAssemblyRow(1);
            var assembly = new AssemblyNameInfo();
            assembly.Name = md.StringsStream.ReadNoNull(assemblyRow.Name);
            assembly.Culture = md.StringsStream.ReadNoNull(assemblyRow.Locale);
            assembly.PublicKeyOrToken = new PublicKey(md.BlobStream.Read(assemblyRow.PublicKey));
            assembly.HashAlgId = (AssemblyHashAlgorithm)assemblyRow.HashAlgId;
            assembly.Version = new Version(assemblyRow.MajorVersion, assemblyRow.MinorVersion, assemblyRow.BuildNumber, assemblyRow.RevisionNumber);
            assembly.Attributes = (AssemblyAttributes)assemblyRow.Flags;
            return GetId(assembly);
        }

        private static string GetId(IAssembly assembly)
        {
            return new SR.AssemblyName(assembly.FullName).FullName.ToUpperInvariant();
        }

        void ImportAssemblyTypeReferences(ModuleDef originModule, ModuleDef stubModule)
        {
            var assembly = stubModule.Assembly;
            foreach (var ca in assembly.CustomAttributes)
            {
                if (ca.AttributeType.Scope == originModule)
                    ca.Constructor = (ICustomAttributeType)stubModule.Import(ca.Constructor);
            }
            foreach (var ca in assembly.DeclSecurities.SelectMany(declSec => declSec.CustomAttributes))
            {
                if (ca.AttributeType.Scope == originModule)
                    ca.Constructor = (ICustomAttributeType)stubModule.Import(ca.Constructor);
            }
        }
    }
}